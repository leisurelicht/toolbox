/* ===== 类型 ===== */
type BillTab = 'aa' | 'discount' | 'unitprice' | 'installment'
type UpUnit = 'g' | 'ml' | 'count'

interface TabOption {
  id: BillTab
  name: string
}

interface UpUnitOption {
  id: UpUnit
  name: string
}

/* ===== 常量 ===== */
const TABS: TabOption[] = [
  { id: 'aa', name: 'AA 分账' },
  { id: 'discount', name: '满减折扣' },
  { id: 'unitprice', name: '单价比较' },
  { id: 'installment', name: '分期年化' },
]

const UP_UNITS: UpUnitOption[] = [
  { id: 'g', name: '克' },
  { id: 'ml', name: '毫升' },
  { id: 'count', name: '件' },
]

/* ===== 工具函数 ===== */
function parseCents(text: string): number {
  const value = Number(text)
  if (!isFinite(value) || value <= 0) return 0
  return Math.round(value * 100)
}

function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2)
}

function parseNumber(text: string, fallback: number): number {
  const value = Number(text)
  return isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clampInt(text: string, min: number, max: number, fallback: number): number {
  const value = parseInt(text, 10)
  if (isNaN(value)) return fallback
  return clamp(value, min, max)
}

function clampFloat(text: string, min: number, max: number, fallback: number): number {
  const value = Number(text)
  if (!isFinite(value)) return fallback
  return clamp(value, min, max)
}

function npv(principal: number, payment: number, periods: number, rate: number): number {
  if (rate === 0) return principal - payment * periods
  let present = 0
  for (let i = 1; i <= periods; i += 1) {
    present += payment / Math.pow(1 + rate, i)
  }
  return principal - present
}

function monthlyIrr(principal: number, payment: number, periods: number): number {
  if (principal <= 0 || payment <= 0 || periods <= 0) return 0
  if (payment * periods <= principal) return 0

  let low = 0
  let high = 1
  for (let i = 0; i < 100; i += 1) {
    const mid = (low + high) / 2
    if (npv(principal, payment, periods, mid) > 0) high = mid
    else low = mid
  }
  return (low + high) / 2
}

/* ===== 结果计算 ===== */
function refreshAA(inst: any) {
  const data = inst.data
  const total = parseCents(data.aaTotalText)
  const extra = parseCents(data.aaExtraText)
  const people = clampInt(data.aaPeopleText, 1, 99, 1)
  const grand = total + extra
  const base = Math.floor(grand / people)
  const remainder = grand - base * people

  inst.setData({
    aaGrandText: formatMoney(grand),
    aaPerText: formatMoney(base),
    aaPerClass: formatMoney(base).length > 8 ? 'small' : '',
    aaRemainderText: formatMoney(remainder),
    aaHint:
      remainder > 0
        ? `${people - remainder} 人付 ${formatMoney(base)} 元，${remainder} 人付 ${formatMoney(
            base + 1
          )} 元`
        : '每人金额相同',
    aaCopyText: `总金额 ${formatMoney(grand)} 元，${people} 人，每人 ${formatMoney(base)} 元${
      remainder > 0 ? `，其中 ${remainder} 人多付 0.01 元` : ''
    }`,
  })
}

function refreshDiscount(inst: any) {
  const data = inst.data
  const price = parseCents(data.discountPriceText)
  const threshold = parseCents(data.discountThresholdText)
  const reduce = parseCents(data.discountReduceText)
  const rate = clampFloat(data.discountRateText, 0, 10, 0)
  const reached = threshold <= 0 || price >= threshold
  const fullPay = reached ? Math.max(0, price - reduce) : price
  const ratePay = Math.round((price * rate) / 10)
  const save = Math.abs(fullPay - ratePay)

  let winner = '两种一样'
  if (fullPay < ratePay) winner = '满减更划算'
  else if (ratePay < fullPay) winner = '折扣更划算'

  const effective = price > 0 ? (fullPay / price) * 10 : 0

  inst.setData({
    discountFullText: formatMoney(fullPay),
    discountRatePayText: formatMoney(ratePay),
    discountWinner: winner,
    discountSaveText: formatMoney(save),
    discountEffectiveText: effective > 0 ? `${effective.toFixed(1)} 折` : '—',
    discountHint: reached ? '' : '未达满减门槛，满减按原价计算',
    discountCopyText: `原价 ${formatMoney(price)} 元：满减实付 ${formatMoney(
      fullPay
    )} 元，${rate} 折实付 ${formatMoney(ratePay)} 元，${winner}，相差 ${formatMoney(save)} 元`,
  })
}

function refreshUnitPrice(inst: any) {
  const data = inst.data
  const unit = data.upUnit as UpUnit
  const multiplier = unit === 'count' ? 1 : 100
  const label = unit === 'g' ? '100g' : unit === 'ml' ? '100ml' : '件'

  const priceA = parseCents(data.upPriceAText)
  const qtyA = parseNumber(data.upQtyAText, 0)
  const priceB = parseCents(data.upPriceBText)
  const qtyB = parseNumber(data.upQtyBText, 0)
  const perA = qtyA > 0 ? (priceA / qtyA) * multiplier : -1
  const perB = qtyB > 0 ? (priceB / qtyB) * multiplier : -1
  const validA = perA >= 0
  const validB = perB >= 0

  let winner = '填完整两项后比较'
  let saveText = ''
  if (validA && validB) {
    if (Math.abs(perA - perB) < 1e-6) winner = '单价一样'
    else if (perA < perB) winner = '商品 A 更划算'
    else winner = '商品 B 更划算'

    const max = Math.max(perA, perB)
    const percent = max > 0 ? Math.round((Math.abs(perA - perB) / max) * 100) : 0
    saveText = `差价约 ${percent}%`
  }

  inst.setData({
    upLabel: label,
    upPerAText: validA ? formatMoney(perA) : '—',
    upPerBText: validB ? formatMoney(perB) : '—',
    upWinner: winner,
    upSaveText: saveText,
    upCopyText: `单价比较（每 ${label}）：A ${
      validA ? formatMoney(perA) : '—'
    } 元，B ${validB ? formatMoney(perB) : '—'} 元，${winner}`,
  })
}

function refreshInstallment(inst: any) {
  const data = inst.data
  const principal = parseCents(data.instPrincipalText)
  const periods = clampInt(data.instPeriodsText, 1, 60, 1)
  const feeRate = clampFloat(data.instFeeText, 0, 10, 0)
  const feePerPeriod = Math.round((principal * feeRate) / 100)
  const payment = principal > 0 ? Math.round(principal / periods + feePerPeriod) : 0
  const totalPayment = payment * periods
  const totalFee = Math.max(0, totalPayment - principal)
  const surface = periods * feeRate
  const monthly = monthlyIrr(principal, payment, periods)
  const annual = (Math.pow(1 + monthly, 12) - 1) * 100

  let hint = '填入本金、期数和费率后计算'
  if (principal > 0 && feeRate > 0) hint = '按等额本金 + 每期手续费估算，仅供比较'
  else if (principal > 0) hint = '费率为 0，实际年化也为 0'

  inst.setData({
    instMonthlyText: formatMoney(payment),
    instTotalFeeText: formatMoney(totalFee),
    instSurfaceText: `${surface.toFixed(2)}%`,
    instAprText: `${annual.toFixed(2)}%`,
    instHint: hint,
    instCopyText: `本金 ${formatMoney(principal)} 元，${periods} 期，每期费率 ${feeRate}%：每月 ${formatMoney(
      payment
    )} 元，总手续费 ${formatMoney(totalFee)} 元，表面总费率 ${surface.toFixed(
      2
    )}%，实际年化 ${annual.toFixed(2)}%`,
  })
}

function recalcAll(inst: any) {
  refreshAA(inst)
  refreshDiscount(inst)
  refreshUnitPrice(inst)
  refreshInstallment(inst)
}

/* ===== 滚动区测高 ===== */
function applyScrollHeight(inst: any) {
  const query = wx.createSelectorQuery()
  query.select('.page-container').boundingClientRect()
  query.select('.top-bar').boundingClientRect()
  query.exec((res: any[]) => {
    const container = res && res[0]
    const topBar = res && res[1]
    let h = 0
    if (container && topBar) {
      h = Math.round(container.height - (topBar.bottom - container.top))
    }
    if (!h || h <= 0) {
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 116 * rpx)
    }
    if (h > 0) inst.setData({ scrollHeight: h })
  })
}

function remeasure(inst: any) {
  wx.nextTick(() => applyScrollHeight(inst))
}

/* ===== 页面 ===== */
Component({
  data: {
    tabs: TABS,
    upUnits: UP_UNITS,
    activeTab: 'aa' as BillTab,
    scrollHeight: 0,
    scrollIntoView: 'bill-top-aa',

    /* AA */
    aaTotalText: '300',
    aaPeopleText: '4',
    aaExtraText: '0',
    aaGrandText: '',
    aaPerText: '',
    aaPerClass: '',
    aaRemainderText: '',
    aaHint: '',
    aaCopyText: '',

    /* 满减 / 折扣 */
    discountPriceText: '300',
    discountThresholdText: '300',
    discountReduceText: '50',
    discountRateText: '8',
    discountFullText: '',
    discountRatePayText: '',
    discountWinner: '',
    discountSaveText: '',
    discountEffectiveText: '',
    discountHint: '',
    discountCopyText: '',

    /* 单价比较 */
    upUnit: 'g' as UpUnit,
    upPriceAText: '19.9',
    upQtyAText: '500',
    upPriceBText: '29.9',
    upQtyBText: '1000',
    upLabel: '100g',
    upPerAText: '',
    upPerBText: '',
    upWinner: '',
    upSaveText: '',
    upCopyText: '',

    /* 分期年化 */
    instPrincipalText: '12000',
    instPeriodsText: '12',
    instFeeText: '0.6',
    instMonthlyText: '',
    instTotalFeeText: '',
    instSurfaceText: '',
    instAprText: '',
    instHint: '',
    instCopyText: '',
  },

  lifetimes: {
    attached() {
      recalcAll(this)
    },
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      recalcAll(this)
      if (this.data.scrollHeight > 0) remeasure(this)
    },
  },

  methods: {
    onTabChange(e: WechatMiniprogram.TouchEvent) {
      const tab = (e.currentTarget.dataset as { id: BillTab }).id
      if (tab === this.data.activeTab) return
      this.setData({
        activeTab: tab,
        scrollIntoView: `bill-top-${tab}`,
      })
      recalcAll(this)
    },

    onFieldInput(e: WechatMiniprogram.Input) {
      const field = String((e.currentTarget.dataset as { field: string }).field)
      const patch: Record<string, string> = {}
      patch[field] = e.detail.value
      this.setData(patch as any)
      recalcAll(this)
    },

    onFieldBlur(e: WechatMiniprogram.Input) {
      const field = String((e.currentTarget.dataset as { field: string }).field)
      const raw = String((this.data as any)[field] || '')
      let next = raw
      if (field === 'aaPeopleText') next = String(clampInt(raw, 1, 99, 1))
      else if (field === 'instPeriodsText') next = String(clampInt(raw, 1, 60, 1))
      else if (field === 'discountRateText') next = String(clampFloat(raw, 0, 10, 0))
      else if (field === 'instFeeText') next = String(clampFloat(raw, 0, 10, 0))

      if (next !== raw) {
        const patch: Record<string, string> = {}
        patch[field] = next
        this.setData(patch as any)
      }
      recalcAll(this)
    },

    onUpUnitChange(e: WechatMiniprogram.TouchEvent) {
      const unit = (e.currentTarget.dataset as { id: UpUnit }).id
      if (unit !== 'g' && unit !== 'ml' && unit !== 'count') return
      this.setData({ upUnit: unit })
      recalcAll(this)
    },

    onCopy(e: WechatMiniprogram.TouchEvent) {
      const text = String((e.currentTarget.dataset as { text: string }).text || '')
      if (!text) return
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'none', duration: 1000 })
        },
      })
    },

    onShareAppMessage() {
      return {
        title: '算账：AA、满减、单价比较和分期真实年化',
        path: '/pages/bill-calc/bill-calc',
      }
    },
  },
})
