/* ========================================
   涨了吗 · 基金详情
   数据：腾讯行情（OHLC/日K）+ QDII Lens（报价/溢价历史/费率）
   图表：原生 view 绘制，不依赖 echarts
   ======================================== */

import {
  EtfMeta,
  Kline,
  PremiumPoint,
  Quote,
  calcPremium,
  calcTrackingError,
  findEtf,
  formatAmount,
  formatPct,
  formatPrice,
  getChangeClass,
  getPremiumClass,
} from '../../utils/fund-data'
import {
  FundQuoteResult,
  fetchBenchmark,
  fetchFundFee,
  fetchFundQuote,
  fetchKline,
  fetchNavHistory,
  fetchPremiumHistory,
  fetchQuotes,
} from '../../utils/fund-api'

const TE_CACHE_KEY = 'fund_te_cache_v1'

interface ChartAxis {
  maxStr: string
  midStr: string
  minStr: string
  startDate: string
  midDate: string
  endDate: string
}

interface PremiumBarView {
  i: number
  cls: string
  top: string
  height: string
  isLast: boolean
}

interface PremiumChart {
  bars: PremiumBarView[]
  zeroTop: string
  axis: ChartAxis
  latestStr: string
  latestClass: string
  avgStr: string
  rangeStr: string
  count: number
  empty: boolean
}

interface CandleView {
  i: number
  cls: string
  wickTop: string
  wickHeight: string
  bodyTop: string
  bodyHeight: string
}

interface PriceChart {
  candles: CandleView[]
  axis: ChartAxis
  latestStr: string
  latestClass: string
  rangeStr: string
  ma5: string
  ma10: string
  ma20: string
  count: number
  empty: boolean
}

/* ===== 图表数据（全部在 TS 中算好，WXML 只取值） ===== */
function emptyAxis(): ChartAxis {
  return {
    maxStr: '--',
    midStr: '--',
    minStr: '--',
    startDate: '--',
    midDate: '--',
    endDate: '--',
  }
}

function emptyPremiumChart(): PremiumChart {
  return {
    bars: [],
    zeroTop: '100%',
    axis: emptyAxis(),
    latestStr: '--',
    latestClass: 'flat',
    avgStr: '--',
    rangeStr: '--',
    count: 0,
    empty: true,
  }
}

function emptyPriceChart(): PriceChart {
  return {
    candles: [],
    axis: emptyAxis(),
    latestStr: '--',
    latestClass: 'flat',
    rangeStr: '--',
    ma5: '--',
    ma10: '--',
    ma20: '--',
    count: 0,
    empty: true,
  }
}

function shortDate(date: string): string {
  if (!date || date.length < 10) return date || '--'
  return `${date.slice(5, 7)}/${date.slice(8, 10)}`
}

function buildPremiumChart(points: PremiumPoint[]): PremiumChart {
  const valid: Array<{ date: string; value: number }> = []
  for (const point of points) {
    if (typeof point.premium === 'number') {
      valid.push({ date: point.date, value: point.premium })
    }
  }
  if (valid.length === 0) return emptyPremiumChart()

  valid.sort((a, b) => a.date.localeCompare(b.date))
  const recent = valid.slice(-90)
  const values = recent.map(item => item.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  let axisMin: number
  let axisMax: number
  if (minValue >= 0) {
    axisMin = 0
    axisMax = maxValue * 1.12
  } else if (maxValue <= 0) {
    axisMax = 0
    axisMin = minValue * 1.12
  } else {
    const span = maxValue - minValue
    axisMin = minValue - span * 0.12
    axisMax = maxValue + span * 0.12
  }
  if (axisMax - axisMin < 0.01) axisMax = axisMin + 0.01

  const range = axisMax - axisMin
  const zeroTop = (axisMax / range) * 100

  const bars: PremiumBarView[] = recent.map((item, index) => {
    const isUp = item.value >= 0
    const y = ((axisMax - item.value) / range) * 100
    const height = Math.max((Math.abs(item.value) / range) * 100, 0.4)
    return {
      i: index,
      cls: isUp ? 'up' : 'down',
      top: `${(isUp ? y : zeroTop).toFixed(2)}%`,
      height: `${height.toFixed(2)}%`,
      isLast: index === recent.length - 1,
    }
  })

  const sum = values.reduce((acc, value) => acc + value, 0)

  return {
    bars,
    zeroTop: `${zeroTop.toFixed(2)}%`,
    axis: {
      maxStr: axisMax.toFixed(2) + '%',
      midStr: ((axisMax + axisMin) / 2).toFixed(2) + '%',
      minStr: axisMin.toFixed(2) + '%',
      startDate: shortDate(recent[0].date),
      midDate: shortDate(recent[Math.floor(recent.length / 2)].date),
      endDate: shortDate(recent[recent.length - 1].date),
    },
    latestStr: formatPct(values[values.length - 1]),
    latestClass: getChangeClass(values[values.length - 1]),
    avgStr: formatPct(sum / values.length),
    rangeStr: `${minValue.toFixed(2)}% ~ ${maxValue.toFixed(2)}%`,
    count: recent.length,
    empty: false,
  }
}

function movingAverage(values: number[], period: number): number | null {
  if (values.length < period) return null
  let sum = 0
  for (let i = values.length - period; i < values.length; i++) {
    sum += values[i]
  }
  return sum / period
}

function buildPriceChart(rawKlines: Kline[]): PriceChart {
  const valid = rawKlines.filter(item => item.close > 0)
  if (valid.length === 0) return emptyPriceChart()

  valid.sort((a, b) => a.date.localeCompare(b.date))
  const recent = valid.slice(-60)
  const highs = recent.map(item => (item.high > 0 ? item.high : item.close))
  const lows = recent.map(item => (item.low > 0 ? item.low : item.close))
  const maxValue = Math.max(...highs)
  const minValue = Math.min(...lows)
  if (maxValue <= 0) return emptyPriceChart()

  const span = maxValue - minValue
  const pad = span > 0 ? span * 0.06 : maxValue * 0.01
  const axisMax = maxValue + pad
  const axisMin = Math.max(0, minValue - pad)
  const range = axisMax - axisMin || 1

  const candles: CandleView[] = recent.map((item, index) => {
    const bodyHigh = Math.max(item.open, item.close)
    const bodyLow = Math.min(item.open, item.close)
    const wickTop = ((axisMax - item.high) / range) * 100
    const wickHeight = ((item.high - item.low) / range) * 100
    const bodyTop = ((axisMax - bodyHigh) / range) * 100
    const bodyHeight = ((bodyHigh - bodyLow) / range) * 100
    return {
      i: index,
      cls: item.close >= item.open ? 'up' : 'down',
      wickTop: `${wickTop.toFixed(2)}%`,
      wickHeight: `${Math.max(wickHeight, 0.4).toFixed(2)}%`,
      bodyTop: `${bodyTop.toFixed(2)}%`,
      bodyHeight: `${Math.max(bodyHeight, 0.5).toFixed(2)}%`,
    }
  })

  const closes = valid.map(item => item.close)
  const latest = closes[closes.length - 1]
  const prev = closes.length >= 2 ? closes[closes.length - 2] : latest
  const ma5 = movingAverage(closes, 5)
  const ma10 = movingAverage(closes, 10)
  const ma20 = movingAverage(closes, 20)

  return {
    candles,
    axis: {
      maxStr: axisMax.toFixed(3),
      midStr: ((axisMax + axisMin) / 2).toFixed(3),
      minStr: axisMin.toFixed(3),
      startDate: shortDate(recent[0].date),
      midDate: shortDate(recent[Math.floor(recent.length / 2)].date),
      endDate: shortDate(recent[recent.length - 1].date),
    },
    latestStr: formatPrice(latest),
    latestClass: getChangeClass(latest - prev),
    rangeStr: `${minValue.toFixed(3)} ~ ${maxValue.toFixed(3)}`,
    ma5: ma5 === null ? '--' : ma5.toFixed(3),
    ma10: ma10 === null ? '--' : ma10.toFixed(3),
    ma20: ma20 === null ? '--' : ma20.toFixed(3),
    count: recent.length,
    empty: false,
  }
}

/* ===== 本地缓存 ===== */

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function readTeCache(code: string): string {
  try {
    const cached = wx.getStorageSync(TE_CACHE_KEY) as
      | { date?: string; map?: Record<string, string> }
      | ''
    if (cached && cached.date === todayStr() && cached.map) {
      return cached.map[code] || ''
    }
  } catch {
    // 忽略缓存异常
  }
  return ''
}

function saveTeCache(code: string, value: string) {
  try {
    const cached = wx.getStorageSync(TE_CACHE_KEY) as
      | { date?: string; map?: Record<string, string> }
      | ''
    const cachedMap = cached && cached.date === todayStr() && cached.map ? cached.map : {}
    const next = Object.assign({}, cachedMap) as Record<string, string>
    next[code] = value
    wx.setStorageSync(TE_CACHE_KEY, { date: todayStr(), map: next })
  } catch {
    // 存储失败不影响功能
  }
}

/* ===== 布局 ===== */

function formatClock(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
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
      height = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 210 * rpx)
    }
    if (height > 0) {
      inst.setData({ scrollHeight: height })
    }
  })
}

function buildErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : '未知错误'
  if (message.indexOf('HTTP') >= 0 || message.indexOf('请求失败') >= 0) {
    return '网络请求失败，请检查网络后重试'
  }
  return message
}

Component({
  data: {
    code: '',
    market: '',
    name: '',
    company: '',
    fullName: '',

    loading: true,
    error: '',

    priceStr: '--',
    changeStr: '--',
    changeClass: 'flat',
    premiumStr: '--',
    premiumClass: 'flat',
    openStr: '--',
    highStr: '--',
    lowStr: '--',
    prevCloseStr: '--',
    navStr: '--',
    amountStr: '--',
    turnoverStr: '--',
    feeStr: '--',
    trackingErrStr: '--',
    trackingErrLoading: false,
    lastUpdate: '--:--:--',

    chartMode: 'premium' as 'premium' | 'price',
    premiumChart: emptyPremiumChart(),
    priceChart: emptyPriceChart(),

    scrollHeight: 0,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
      // 导航栏安全区在 attached 后异步设置，稍后再量一次更稳妥
      setTimeout(() => applyScrollHeight(this), 120)
    },
  },

  methods: {
    onLoad(query: Record<string, string | undefined>) {
      const code = query.code || ''
      const meta = findEtf(code)
      if (!meta) {
        this.setData({ code, loading: false, error: '未找到该基金信息' })
        return
      }
      this.setData({
        code: meta.code,
        market: meta.market,
        name: meta.fullName,
        company: meta.company,
        fullName: meta.fullName,
      })
      this.loadAllData()
    },

    async loadAllData() {
      const meta = findEtf(this.data.code)
      if (!meta) {
        this.setData({ loading: false, error: '未找到该基金信息' })
        return
      }

      const hasData = this.data.lastUpdate !== '--:--:--'
      this.setData({ loading: !hasData, error: '' })

      try {
        const [quoteRes, klineRes] = await Promise.all([
          fetchQuotes([meta]).catch(() => null),
          fetchKline(meta, 250).catch(() => null),
        ])
        const [fundQuote, premiumRes, feeRes] = await Promise.all([
          fetchFundQuote(meta.code).catch(() => null),
          fetchPremiumHistory(meta.code, '1y').catch(() => null),
          fetchFundFee(meta.code).catch(() => null),
        ])

        if (!quoteRes && !fundQuote) {
          if (hasData) {
            this.setData({ loading: false })
            wx.showToast({ title: '刷新失败，请稍后重试', icon: 'none', duration: 1500 })
          } else {
            this.setData({ loading: false, error: '行情加载失败，请稍后重试' })
          }
          return
        }

        const tx = quoteRes && quoteRes.items.length > 0 ? quoteRes.items[0] : null
        this.applyQuote(meta, tx, fundQuote)

        const points = premiumRes ? premiumRes.points : []
        const priceKlines = klineRes ? klineRes.klines : []

        this.setData({
          loading: false,
          premiumChart: buildPremiumChart(points),
          priceChart: buildPriceChart(priceKlines),
          feeStr: feeRes ? feeRes.totalPct.toFixed(2) + '%' : '--',
          lastUpdate: formatClock(new Date()),
        })

        this.loadTrackingError(meta)
      } catch (err) {
        if (hasData) {
          this.setData({ loading: false })
          wx.showToast({ title: '刷新失败，请稍后重试', icon: 'none', duration: 1500 })
        } else {
          this.setData({
            loading: false,
            error: buildErrorMessage(err),
          })
        }
      }
    },

    applyQuote(meta: EtfMeta, tx: Quote | null, fundQuote: FundQuoteResult | null) {
      const price = fundQuote && typeof fundQuote.market_price === 'number'
        ? fundQuote.market_price
        : (tx ? tx.price : null)
      const iopv = fundQuote && typeof fundQuote.iopv === 'number'
        ? fundQuote.iopv
        : (tx ? tx.iopv : null)
      const changePct = fundQuote && typeof fundQuote.price_change_pct === 'number'
        ? fundQuote.price_change_pct
        : (tx ? tx.changePct : null)
      const premium = fundQuote && typeof fundQuote.indicative_premium_pct === 'number'
        ? fundQuote.indicative_premium_pct
        : calcPremium(price, iopv)
      const open = tx ? tx.open : null
      const high = tx ? tx.high : null
      const low = tx ? tx.low : null
      const prevClose = fundQuote && typeof fundQuote.prev_close === 'number'
        ? fundQuote.prev_close
        : (tx ? tx.prevClose : null)
      const amountWan = fundQuote && typeof fundQuote.turnover_cny === 'number'
        ? fundQuote.turnover_cny / 10000
        : (tx ? tx.amountWan : null)
      const turnover = tx ? tx.turnover : null

      this.setData({
        name: meta.fullName,
        company: meta.company,
        priceStr: formatPrice(price),
        changeStr: formatPct(changePct),
        changeClass: getChangeClass(changePct),
        premiumStr: formatPct(premium),
        premiumClass: getPremiumClass(premium),
        openStr: formatPrice(open),
        highStr: formatPrice(high),
        lowStr: formatPrice(low),
        prevCloseStr: formatPrice(prevClose),
        navStr: formatPrice(iopv),
        amountStr: formatAmount(amountWan),
        turnoverStr: turnover === null || turnover === undefined ? '--' : turnover.toFixed(2) + '%',
      })
    },

    async loadTrackingError(meta: EtfMeta) {
      // QDII Lens 暂不提供美国50的对标基准
      if (meta.index === 'us-50') {
        this.setData({ trackingErrStr: '无基准' })
        return
      }

      const cached = readTeCache(meta.code)
      if (cached) {
        this.setData({ trackingErrStr: cached })
        return
      }

      const indexSlug = meta.index
      this.setData({ trackingErrLoading: true })

      try {
        const [navRes, benchmarkRes] = await Promise.all([
          fetchNavHistory(meta.code),
          fetchBenchmark(indexSlug),
        ])
        const te = calcTrackingError(navRes.navList, benchmarkRes.klines)
        const value = te === null || !isFinite(te) ? '数据不足' : (te * 100).toFixed(2) + '%'
        this.setData({ trackingErrStr: value, trackingErrLoading: false })
        saveTeCache(meta.code, value)
      } catch {
        this.setData({ trackingErrStr: '--', trackingErrLoading: false })
      }
    },

    switchChart(e: WechatMiniprogram.TouchEvent) {
      const mode = e.currentTarget.dataset.mode as string
      if (mode !== 'premium' && mode !== 'price') return
      if (mode === this.data.chartMode) return
      this.setData({ chartMode: mode })
    },

    onRefresh() {
      wx.showToast({ title: '正在刷新', icon: 'none', duration: 800 })
      this.loadAllData()
    },
  },
})
