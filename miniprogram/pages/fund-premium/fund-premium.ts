/* ========================================
   涨了吗 · ETF 溢折率列表
   数据：腾讯实时行情 + QDII Lens 申购状态 / 费率 / 跟踪误差
   ======================================== */

import {
  ALL_ETFS,
  BENCHMARK,
  ClosePoint,
  EtfMeta,
  FundCard,
  NASDAQ_100_ETFS,
  Quote,
  SP500_ETFS,
  US50_ETFS,
  SubStatus,
  TrendPoint,
  calcPremium,
  calcTrackingError,
  formatAmount,
  formatPct,
  formatPrice,
  getChangeClass,
  getPremiumClass,
} from '../../utils/fund-data'
import {
  fetchBenchmark,
  fetchFundFee,
  fetchNavHistory,
  fetchPremiumTrend,
  fetchQuotes,
  fetchRankings,
  isTradingHours,
  pickSubStatus,
} from '../../utils/fund-api'

const REFRESH_INTERVAL = 5000
const TE_CACHE_KEY = 'fund_te_cache_v1'
const TRACKED_ETFS: EtfMeta[] = NASDAQ_100_ETFS.concat(SP500_ETFS)

type TabKey = 'nasdaq' | 'sp500' | 'us50'

interface TrendBar {
  i: number
  up: number
  down: number
}

interface TrendData {
  label: string
  anchor: string
  currentStr: string
  cls: string
  bars: TrendBar[]
  lastIndex: number
  rangeStr: string
  hasData: boolean
}

/* ===== 页面级缓存（页面卸载后保留，重新进入时可秒开） ===== */
let latestQuotes: Quote[] = []
let nasdaqCards: FundCard[] = []
let sp500Cards: FundCard[] = []
let us50Cards: FundCard[] = []
let premiumOrder: Record<string, string[]> = {}
let refreshTimer: number | null = null
let lastFetchAt = 0
let initialFetchStarted = false
let subCache: Record<string, SubStatus> = {}
let subLoaded = false
let teCache: Record<string, string> = {}
let teLoaded = false
let feeCache: Record<string, string> = {}
let feeLoaded = false
let trendCache: Record<string, TrendPoint[]> = {}
let trendLoading: Record<string, boolean> = {}

function emptyTrend(label: string): TrendData {
  return {
    label,
    anchor: 'center',
    currentStr: '--',
    cls: '',
    bars: [],
    lastIndex: -1,
    rangeStr: '近60日 -- ~ --',
    hasData: false,
  }
}

function formatClock(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function restoreTeCache() {
  try {
    const cached = wx.getStorageSync(TE_CACHE_KEY) as
      | { date?: string; map?: Record<string, string> }
      | ''
    if (cached && cached.date === todayStr() && cached.map) {
      teCache = cached.map
      // 美国50 没有可用基准，不参与跟踪误差缓存判断
      teLoaded = TRACKED_ETFS.every(etf => etf.code in teCache)
    }
  } catch {
    // 缓存读取失败不影响功能
  }
}

function saveTeCache() {
  try {
    wx.setStorageSync(TE_CACHE_KEY, { date: todayStr(), map: teCache })
  } catch {
    // 存储失败不影响功能
  }
}

/** 首次按溢价率升序定序，后续刷新沿用该顺序，新基金追加到末尾 */
function applyPremiumOrder(tab: string, list: FundCard[]): FundCard[] {
  const saved = premiumOrder[tab]
  if (!saved) {
    list.sort((a, b) => {
      const pa = a.premium === null ? Infinity : a.premium
      const pb = b.premium === null ? Infinity : b.premium
      return pa - pb
    })
    premiumOrder[tab] = list.map(item => item.code)
    return list
  }

  const position: Record<string, number> = {}
  saved.forEach((code, index) => {
    position[code] = index
  })
  list.sort((a, b) => {
    const ia = position[a.code]
    const ib = position[b.code]
    if (ia === undefined && ib === undefined) return 0
    if (ia === undefined) return 1
    if (ib === undefined) return -1
    return ia - ib
  })

  const appended = list.filter(item => position[item.code] === undefined).map(item => item.code)
  if (appended.length) premiumOrder[tab] = saved.concat(appended)
  return list
}

function buildCards(
  tab: string,
  pool: EtfMeta[],
  quotes: Quote[],
  subMap: Record<string, SubStatus>,
  teMap: Record<string, string>,
  feeMap: Record<string, string>
): FundCard[] {
  const list = pool.map(etf => {
    const quote = quotes.find(item => item.code === etf.code)
    const price = quote ? quote.price : null
    const iopv = quote ? quote.iopv : null
    const changePct = quote ? quote.changePct : null
    const premium = calcPremium(price, iopv)
    const sub = subMap[etf.code]

    return {
      code: etf.code,
      market: etf.market,
      name: etf.name,
      company: etf.company,
      fullName: etf.fullName,
      price,
      premium,
      change: changePct,
      priceStr: formatPrice(price),
      changeStr: formatPct(changePct),
      changeClass: getChangeClass(changePct),
      premiumStr: formatPct(premium),
      premiumClass: getPremiumClass(premium),
      iopvStr: formatPrice(iopv),
      amountStr: formatAmount(quote ? quote.amountWan : null),
      trackingErrStr: etf.index === 'us-50' ? '无基准' : (teMap[etf.code] || '--'),
      feeStr: feeMap[etf.code] || '--',
      subStatus: sub ? sub.status : '',
      subLabel: sub ? sub.label : '',
      quoteTime: quote ? quote.time : '',
    } as FundCard
  })

  return applyPremiumOrder(tab, list)
}

/** 只更新某一项指标，避免整列表重新 setData */
function patchCard(inst: any, code: string, patch: Partial<FundCard>) {
  const groups = [nasdaqCards, sp500Cards, us50Cards]
  for (const list of groups) {
    const index = list.findIndex(item => item.code === code)
    if (index >= 0) {
      list[index] = Object.assign({}, list[index], patch) as FundCard
    }
  }

  const active = inst.data.activeTab === 'nasdaq'
    ? nasdaqCards
    : (inst.data.activeTab === 'us50' ? us50Cards : sp500Cards)
  const activeIndex = active.findIndex(item => item.code === code)
  if (activeIndex >= 0) {
    inst.setData({ [`list[${activeIndex}]`]: active[activeIndex] })
  }
}

function buildErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : '未知错误'
  if (message.indexOf('HTTP') >= 0 || message.indexOf('请求失败') >= 0) {
    return '网络请求失败，请检查网络后重试'
  }
  return message
}

/* 固定顶栏 + 局部滚动，滚动区高度需在运行时测量 */
function applyScrollHeight(inst: any) {
  const query = wx.createSelectorQuery()
  query.select('.page-container').boundingClientRect()
  query.select('.top-bar').boundingClientRect()
  query.exec((res: any[]) => {
    const container = res && res[0]
    const topBar = res && res[1]
    let height = 0
    if (container && topBar) {
      height = Math.round(container.height - (topBar.bottom - container.top))
    }
    if (!height || height <= 0) {
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      height = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 360 * rpx)
    }
    if (height > 0) {
      inst.setData({ scrollHeight: height })
    }
  })
}

function stopAutoRefresh() {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function startAutoRefresh(inst: any) {
  stopAutoRefresh()
  // 先恢复当日跟踪误差缓存，保证首屏卡片就能显示
  restoreTeCache()
  refreshTimer = setInterval(() => {
    if (isTradingHours()) inst.fetchData()
  }, REFRESH_INTERVAL)
  // 上次拉取超过 30 秒才重新拉，避免从详情页返回时重复请求
  if (Date.now() - lastFetchAt > 30000) {
    inst.fetchData()
  }
}

/* ready 阶段调用，避开 lifetimes 中 this 类型推断不到 methods 的问题 */
function bootstrap(inst: any) {
  restoreTeCache()
  inst.loadTrend()
  applyScrollHeight(inst)
  // 兜底：若 pageLifetimes.show 未触发，这里发起首轮行情请求
  if (!initialFetchStarted) inst.fetchData()
  // 导航栏安全区在 attached 后异步设置，稍后再量一次更稳妥
  setTimeout(() => applyScrollHeight(inst), 120)
}

Component({
  data: {
    activeTab: 'nasdaq' as TabKey,
    list: [] as FundCard[],
    loading: true,
    refreshing: false,
    error: '',
    lastUpdate: '--:--:--',
    isTrading: true,
    scrollHeight: 0,
    trend: emptyTrend('纳指100'),
  },

  lifetimes: {
    ready() {
      bootstrap(this)
    },
    detached() {
      stopAutoRefresh()
      initialFetchStarted = false
    },
  },

  pageLifetimes: {
    show() {
      startAutoRefresh(this)
    },
    hide() {
      stopAutoRefresh()
    },
  },

  methods: {
    /* ========== 行情拉取 ========== */
    async fetchData() {
      initialFetchStarted = true
      const hasList = this.data.list.length > 0
      if (!hasList) {
        this.setData({ loading: true, error: '' })
      }

      try {
        const res = await fetchQuotes(ALL_ETFS)
        latestQuotes = res.items
        nasdaqCards = buildCards('nasdaq', NASDAQ_100_ETFS, latestQuotes, subCache, teCache, feeCache)
        sp500Cards = buildCards('sp500', SP500_ETFS, latestQuotes, subCache, teCache, feeCache)
        us50Cards = buildCards('us50', US50_ETFS, latestQuotes, subCache, teCache, feeCache)
        lastFetchAt = Date.now()

        this.setData({
          list: this.currentCards(),
          isTrading: isTradingHours(),
          lastUpdate: formatClock(new Date()),
          loading: false,
          refreshing: false,
          error: '',
        })

        if (!subLoaded) this.loadSubStatus()
        if (!teLoaded) this.loadTrackingErrors()
        if (!feeLoaded) this.loadFees()
      } catch (err) {
        if (hasList) {
          const manual = this.data.refreshing
          this.setData({ loading: false, refreshing: false })
          if (manual) {
            wx.showToast({ title: '行情刷新失败', icon: 'none', duration: 1500 })
          }
        } else {
          this.setData({
            loading: false,
            refreshing: false,
            error: buildErrorMessage(err),
          })
        }
      }
    },

    currentCards(): FundCard[] {
      return this.cardsForTab(this.data.activeTab)
    },

    cardsForTab(tab: TabKey): FundCard[] {
      if (tab === 'sp500') return sp500Cards
      if (tab === 'us50') return us50Cards
      return nasdaqCards
    },

    /* ========== 申购状态 ========== */
    async loadSubStatus() {
      subLoaded = true
      try {
        const [nasdaqRes, sp500Res, us50Res] = await Promise.all([
          fetchRankings(BENCHMARK.nasdaq),
          fetchRankings(BENCHMARK.sp500),
          fetchRankings(BENCHMARK.us50),
        ])
        for (const item of nasdaqRes.items.concat(sp500Res.items, us50Res.items)) {
          const sub = pickSubStatus(item.rules)
          if (!sub) continue
          subCache[item.code] = sub
          patchCard(this, item.code, { subStatus: sub.status, subLabel: sub.label })
        }
      } catch {
        // 申购状态失败不影响主流程
      }
    },

    /* ========== 费率 ========== */
    async loadFees() {
      feeLoaded = true
      for (const etf of ALL_ETFS) {
        try {
          const res = await fetchFundFee(etf.code)
          const feeStr = res.totalPct.toFixed(2) + '%'
          feeCache[etf.code] = feeStr
          patchCard(this, etf.code, { feeStr })
        } catch {
          feeCache[etf.code] = '--'
          patchCard(this, etf.code, { feeStr: '--' })
        }
      }
    },

    /* ========== 跟踪误差 ========== */
    loadTrackingErrors() {
      teLoaded = true
      this.loadGroupTrackingError(NASDAQ_100_ETFS)
      this.loadGroupTrackingError(SP500_ETFS)
    },

    async loadGroupTrackingError(pool: EtfMeta[]) {
      if (pool.length === 0) return
      const indexSlug = pool[0].index
      let benchmark: ClosePoint[] = []
      try {
        const res = await fetchBenchmark(indexSlug)
        benchmark = res.klines
      } catch {
        // 该指数没有可用基准（如美国50）或网络失败
        const fallback = indexSlug === 'us-50' ? '无基准' : '--'
        for (const etf of pool) patchCard(this, etf.code, { trackingErrStr: fallback })
        return
      }

      for (const etf of pool) {
        const cached = teCache[etf.code]
        if (cached) {
          patchCard(this, etf.code, { trackingErrStr: cached })
          continue
        }
        try {
          const navRes = await fetchNavHistory(etf.code)
          const te = calcTrackingError(navRes.navList, benchmark)
          const value = te === null || !isFinite(te) ? '数据不足' : (te * 100).toFixed(2) + '%'
          teCache[etf.code] = value
          saveTeCache()
          patchCard(this, etf.code, { trackingErrStr: value })
        } catch {
          patchCard(this, etf.code, { trackingErrStr: '--' })
        }
      }
    },

    /* ========== 溢价中位数趋势 ========== */
    loadTrend() {
      this.fetchTrendFor('nasdaq')
      this.fetchTrendFor('sp500')
      this.fetchTrendFor('us50')
    },

    fetchTrendFor(tab: TabKey) {
      if (trendCache[tab] || trendLoading[tab]) {
        if (this.data.activeTab === tab) this.applyTrend()
        return
      }
      trendLoading[tab] = true
      const slug = tab === 'sp500'
        ? BENCHMARK.sp500
        : (tab === 'us50' ? BENCHMARK.us50 : BENCHMARK.nasdaq)
      fetchPremiumTrend(slug, 90)
        .then(res => {
          trendCache[tab] = res.points
          if (this.data.activeTab === tab) this.applyTrend()
        })
        .catch(() => {
          // 趋势失败时保留占位，不阻塞列表
        })
        .then(() => {
          trendLoading[tab] = false
        })
    },

    applyTrend() {
      const tab = this.data.activeTab
      const points = trendCache[tab] || []
      const label = tab === 'sp500'
        ? '标普500'
        : (tab === 'us50' ? '美国50' : '纳指100')

      if (points.length === 0) {
        this.setData({ trend: emptyTrend(label) })
        return
      }

      const recent = points
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-60)
      const values = recent.map(point => point.median)
      const hasNeg = values.some(value => value < 0)
      const maxAbs = Math.max(1, ...values.map(value => Math.abs(value)))
      const scale = hasNeg ? 46 : 92

      const bars: TrendBar[] = recent.map((point, index) => {
        const isUp = point.median >= 0
        const height = Math.max(3, (Math.abs(point.median) / maxAbs) * scale + 2)
        return { i: index, up: isUp ? height : 0, down: isUp ? 0 : height }
      })

      const last = values[values.length - 1]
      const min = Math.min(...values)
      const max = Math.max(...values)

      this.setData({
        trend: {
          label,
          anchor: hasNeg ? 'center' : 'bottom',
          currentStr: formatPct(last),
          cls: getChangeClass(last),
          bars,
          lastIndex: bars.length - 1,
          rangeStr: `近60日 ${min.toFixed(1)}% ~ ${max.toFixed(1)}%`,
          hasData: true,
        },
      })
    },

    /* ========== 交互 ========== */
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const tab = e.currentTarget.dataset.tab as string
      if (tab !== 'nasdaq' && tab !== 'sp500' && tab !== 'us50') return
      if (tab === this.data.activeTab) return
      this.setData({
        activeTab: tab,
        list: this.cardsForTab(tab),
      })
      this.fetchTrendFor(tab)
      this.applyTrend()
    },

    onRefresh() {
      if (this.data.refreshing) return
      this.setData({ refreshing: true })
      wx.vibrateShort({ type: 'light' })
      this.fetchData()
    },

    goDetail(e: WechatMiniprogram.TouchEvent) {
      const code = e.currentTarget.dataset.code as string
      if (!code) return
      wx.navigateTo({ url: `/pages/fund-detail/fund-detail?code=${code}` })
    },
  },
})
