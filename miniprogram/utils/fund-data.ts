/* ========================================
   涨了吗 · 基金静态数据与通用计算
   数据源：腾讯行情 + QDII Lens
   ======================================== */

export type Market = 'sh' | 'sz'
export type IndexSlug = 'nasdaq-100' | 'sp-500' | 'us-50'

export interface EtfMeta {
  code: string
  market: Market
  index: IndexSlug
  name: string
  company: string
  fullName: string
}

export interface Quote {
  code: string
  name: string
  price: number | null
  prevClose: number | null
  open: number | null
  change: number | null
  changePct: number | null
  high: number | null
  low: number | null
  amountWan: number | null
  turnover: number | null
  iopv: number | null
  nav: number | null
  time: string
}

export interface Kline {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export interface NavPoint {
  date: string
  nav: number
}

export interface ClosePoint {
  date: string
  close: number
}

export interface PremiumPoint {
  date: string
  premium: number | null
  closePrice: number | null
  nav: number | null
  iopv: number | null
}

export interface TrendPoint {
  date: string
  median: number
  sample: number
}

export interface SubStatus {
  status: string
  label: string
}

/** 列表卡片展示数据（所有格式化均在这里完成，WXML 不调用方法） */
export interface FundCard {
  code: string
  market: Market
  name: string
  company: string
  fullName: string
  price: number | null
  premium: number | null
  change: number | null
  priceStr: string
  changeStr: string
  changeClass: string
  premiumStr: string
  premiumClass: string
  iopvStr: string
  amountStr: string
  trackingErrStr: string
  feeStr: string
  subStatus: string
  subLabel: string
  quoteTime: string
}

/* ===== ETF 代码池 ===== */

export const NASDAQ_100_ETFS: EtfMeta[] = [
  { code: '513100', market: 'sh', index: 'nasdaq-100', name: '纳指ETF',        company: '国泰',     fullName: '国泰纳斯达克100ETF' },
  { code: '159501', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '嘉实',     fullName: '嘉实纳斯达克100ETF' },
  { code: '513300', market: 'sh', index: 'nasdaq-100', name: '纳斯达克ETF',     company: '华夏',     fullName: '华夏纳斯达克100ETF' },
  { code: '159941', market: 'sz', index: 'nasdaq-100', name: '纳指ETF',        company: '广发',     fullName: '广发纳斯达克100ETF' },
  { code: '159659', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '招商',     fullName: '招商纳斯达克100ETF' },
  { code: '159660', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '汇添富',   fullName: '汇添富纳斯达克100ETF' },
  { code: '159696', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '易方达',   fullName: '易方达纳斯达克100ETF' },
  { code: '513110', market: 'sh', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '华泰柏瑞', fullName: '华泰柏瑞纳斯达克100ETF' },
  { code: '159513', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '大成',     fullName: '大成纳斯达克100ETF' },
  { code: '159632', market: 'sz', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '华安',     fullName: '华安纳斯达克100ETF' },
  { code: '513390', market: 'sh', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '博时',     fullName: '博时纳斯达克100ETF' },
  { code: '513870', market: 'sh', index: 'nasdaq-100', name: '纳斯达克100ETF',  company: '富国',     fullName: '富国纳斯达克100ETF' },
]

export const SP500_ETFS: EtfMeta[] = [
  { code: '513500', market: 'sh', index: 'sp-500', name: '标普500ETF', company: '博时', fullName: '博时标普500ETF' },
  { code: '159612', market: 'sz', index: 'sp-500', name: '标普500ETF', company: '国泰', fullName: '国泰标普500ETF' },
  { code: '159655', market: 'sz', index: 'sp-500', name: '标普500ETF', company: '华夏', fullName: '华夏标普500ETF' },
  { code: '513650', market: 'sh', index: 'sp-500', name: '标普500ETF', company: '南方', fullName: '南方标普500ETF' },
]

export const US50_ETFS: EtfMeta[] = [
  { code: '513850', market: 'sh', index: 'us-50', name: '美国50ETF', company: '易方达', fullName: '易方达MSCI美国50ETF' },
  { code: '159577', market: 'sz', index: 'us-50', name: '美国50ETF', company: '汇添富', fullName: '汇添富MSCI美国50ETF' },
]

export const ALL_ETFS: EtfMeta[] = NASDAQ_100_ETFS.concat(SP500_ETFS, US50_ETFS)

export const BENCHMARK = {
  nasdaq: 'nasdaq-100' as IndexSlug,
  sp500: 'sp-500' as IndexSlug,
  us50: 'us-50' as IndexSlug,
}

const ETF_MAP: Record<string, EtfMeta> = {}
for (const etf of ALL_ETFS) {
  ETF_MAP[etf.code] = etf
}

export function findEtf(code: string): EtfMeta | null {
  return ETF_MAP[code] || null
}

/* ===== 计算 ===== */

/** 溢折率 =（最新价 - 参考净值）/ 参考净值 × 100 */
export function calcPremium(
  price: number | null | undefined,
  nav: number | null | undefined
): number | null {
  if (price === null || price === undefined) return null
  if (nav === null || nav === undefined || nav === 0) return null
  return ((price - nav) / nav) * 100
}

/* ===== 格式化 ===== */

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--'
  return value.toFixed(3)
}

export function formatAmount(amountWan: number | null | undefined): string {
  if (amountWan === null || amountWan === undefined) return '--'
  if (amountWan >= 10000) return (amountWan / 10000).toFixed(2) + '亿'
  if (amountWan >= 1) return amountWan.toFixed(0) + '万'
  if (amountWan === 0) return '0'
  return '--'
}

/** 涨跌颜色：A 股习惯红涨绿跌 */
export function getChangeClass(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}

/** 溢折率颜色：高溢价红色告警，折价绿色 */
export function getPremiumClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'flat'
  if (value > 0.5) return 'premium-high'
  if (value > 0) return 'premium'
  if (value < -0.5) return 'discount'
  return 'flat'
}

/**
 * 跟踪误差（年化）
 * std(ETF 净值日收益率 - 基准指数日收益率) × sqrt(242)
 * 跳过净值未更新日，避免 QDII T+1 公布造成的假性偏离。
 */
export function calcTrackingError(
  navList: NavPoint[] | null | undefined,
  indexList: ClosePoint[] | null | undefined
): number | null {
  if (!navList || !indexList || navList.length < 20 || indexList.length < 20) {
    return null
  }

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const cutoff = oneYearAgo.toISOString().slice(0, 10)

  const idxMap: Record<string, number> = {}
  for (const item of indexList) {
    if (item.close > 0 && item.date >= cutoff) idxMap[item.date] = item.close
  }

  const sortedNav = navList
    .filter(i => i.nav > 0 && i.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))

  const diffs: number[] = []
  for (let i = 1; i < sortedNav.length; i++) {
    const nPrev = sortedNav[i - 1]
    const nCur = sortedNav[i]
    if (nPrev.nav <= 0 || nCur.nav <= 0) continue

    const nRet = (nCur.nav - nPrev.nav) / nPrev.nav
    if (Math.abs(nRet) < 1e-6) continue

    const iPrev = idxMap[nPrev.date]
    const iCur = idxMap[nCur.date]
    if (iPrev === undefined || iCur === undefined || iPrev === 0) continue

    diffs.push(nRet - (iCur - iPrev) / iPrev)
  }

  if (diffs.length < 20) return null

  const mean = diffs.reduce((sum, value) => sum + value, 0) / diffs.length
  const variance = diffs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (diffs.length - 1)
  return Math.sqrt(variance) * Math.sqrt(242)
}
