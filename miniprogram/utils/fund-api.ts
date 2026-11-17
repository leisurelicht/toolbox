/* ========================================
   涨了吗 · 数据接口
   数据源：腾讯行情（实时/日K）+ QDII Lens（报价/净值/溢价）
   ======================================== */

import {
  ClosePoint,
  EtfMeta,
  Kline,
  NavPoint,
  PremiumPoint,
  Quote,
  SubStatus,
  TrendPoint,
} from './fund-data'

const QUOTE_URL = 'https://qt.gtimg.cn/q='
const KLINE_URL = 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get'
const QDII_BASE = 'https://qdiilens.com/v1'

const MARKET_PREFIX: Record<string, string> = { sh: 'sh', sz: 'sz' }

type RequestData = WechatMiniprogram.IAnyObject

function requestText(label: string, url: string, data?: RequestData): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      dataType: '其他',
      timeout: 15000,
      data,
      success(res) {
        if (res.statusCode !== 200 || typeof res.data !== 'string') {
          reject(new Error(`${label}接口异常 HTTP ${res.statusCode}`))
          return
        }
        resolve(res.data)
      },
      fail(err) {
        reject(new Error(`${label}请求失败: ${err.errMsg || ''}`))
      },
    })
  })
}

function requestJson<T>(label: string, url: string, data?: RequestData): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      dataType: 'json',
      timeout: 15000,
      data,
      success(res) {
        if (res.statusCode !== 200 || res.data === null || typeof res.data !== 'object') {
          reject(new Error(`${label}接口异常 HTTP ${res.statusCode}`))
          return
        }
        resolve(res.data as T)
      },
      fail(err) {
        reject(new Error(`${label}请求失败: ${err.errMsg || ''}`))
      },
    })
  })
}

/* ==================== 腾讯实时行情 ==================== */

export async function fetchQuotes(etfs: EtfMeta[]): Promise<{ items: Quote[]; timestamp: number }> {
  const symbols = etfs.map(etf => MARKET_PREFIX[etf.market] + etf.code).join(',')
  const text = await requestText('行情', QUOTE_URL + symbols)
  const items = parseQuoteText(text)
  if (items.length === 0) throw new Error('行情数据为空')
  return { items, timestamp: Date.now() }
}

/** 解析腾讯批量行情文本：v_sh513100="1~名称~513100~2.142~..." */
export function parseQuoteText(text: string): Quote[] {
  const items: Quote[] = []
  const lines = text.split(';')
  for (const line of lines) {
    const idx = line.indexOf('=')
    if (idx < 0) continue
    const valuePart = line.slice(idx + 1).trim()
    if (valuePart.length < 2 || valuePart[0] !== '"') continue
    const body = valuePart.slice(1, -1)
    if (!body) continue
    const fields = body.split('~')
    if (fields.length < 40) continue
    items.push(parseQuoteFields(fields))
  }
  return items
}

function numAt(fields: string[], index: number): number | null {
  const value = parseFloat(fields[index])
  return isNaN(value) ? null : value
}

function parseQuoteFields(fields: string[]): Quote {
  // IOPV 在 CNY 前第 4 位（盘中估值净值），NAV 在 CNY 前第 1 位（最新披露净值）
  let iopv: number | null = null
  let nav: number | null = null
  const cnyIdx = fields.lastIndexOf('CNY')
  if (cnyIdx >= 4) {
    const value = parseFloat(fields[cnyIdx - 4])
    if (!isNaN(value) && value > 0.5) iopv = value
  }
  if (cnyIdx > 0) {
    const value = parseFloat(fields[cnyIdx - 1])
    if (!isNaN(value)) nav = value
  }
  if (iopv === null) iopv = nav

  return {
    code: fields[2] || '',
    name: fields[1] || '',
    price: numAt(fields, 3),
    prevClose: numAt(fields, 4),
    open: numAt(fields, 5),
    change: numAt(fields, 31),
    changePct: numAt(fields, 32),
    high: numAt(fields, 33),
    low: numAt(fields, 34),
    amountWan: numAt(fields, 37),
    turnover: numAt(fields, 38),
    iopv,
    nav,
    time: fields[30] || '',
  }
}

/* ==================== 腾讯日 K ==================== */

interface KlineNodeRaw {
  qfqday?: unknown[][]
  day?: unknown[][]
}

interface KlineResponse {
  code?: number
  data?: Record<string, KlineNodeRaw>
}

export async function fetchKline(etf: EtfMeta, count = 250): Promise<{ klines: Kline[] }> {
  const symbol = MARKET_PREFIX[etf.market] + etf.code
  const res = await requestJson<KlineResponse>('K线', KLINE_URL, {
    param: `${symbol},day,,,${count},qfq`,
  })
  const node = res.data && res.data[symbol]
  if (!res.data || res.code !== 0 || !node) throw new Error('K线数据为空')

  const raw = node.qfqday || node.day || []
  const klines = raw.map(parseKlineRow)
  if (klines.length === 0) throw new Error('K线数据为空')
  return { klines }
}

function parseKlineRow(row: unknown[]): Kline {
  return {
    date: String(row[0] || ''),
    open: parseFloat(String(row[1])) || 0,
    close: parseFloat(String(row[2])) || 0,
    high: parseFloat(String(row[3])) || 0,
    low: parseFloat(String(row[4])) || 0,
    volume: parseFloat(String(row[5])) || 0,
  }
}

/* ==================== QDII Lens ==================== */

interface RankingRawItem {
  fund?: { code?: string }
  quote?: { code?: string }
  rules?: Array<{ action?: string; status?: string }>
}

interface RankingsResponse {
  data?: RankingRawItem[]
  meta?: WechatMiniprogram.IAnyObject
}

export interface RankingItem {
  code: string
  rules: Array<{ action?: string; status?: string }>
}

/** 按指数拉溢价排行，附带申购状态规则 */
export async function fetchRankings(
  indexSlug: string
): Promise<{ items: RankingItem[]; meta: WechatMiniprogram.IAnyObject }> {
  const res = await requestJson<RankingsResponse>('QDII Lens 排行', `${QDII_BASE}/rankings/premiums`, {
    index: indexSlug,
  })
  if (!Array.isArray(res.data)) throw new Error('QDII Lens 排行数据为空')

  const items: RankingItem[] = []
  for (const item of res.data) {
    const code = (item.fund && item.fund.code) || (item.quote && item.quote.code) || ''
    if (!code) continue
    items.push({ code, rules: item.rules || [] })
  }
  return { items, meta: res.meta || {} }
}

export interface FundQuote {
  market_price?: number | null
  nav?: number | null
  iopv?: number | null
  price_change_pct?: number | null
  indicative_premium_pct?: number | null
  official_nav_premium_pct?: number | null
  prev_close?: number | null
  turnover_cny?: number | null
  trading_date?: string
}

export interface FundQuoteResult extends FundQuote {
  code: string
}

/** 单基金实时行情快照 */
export async function fetchFundQuote(code: string): Promise<FundQuoteResult> {
  const res = await requestJson<{ data?: FundQuote }>(
    'QDII Lens 报价',
    `${QDII_BASE}/funds/${code}/quote`
  )
  if (!res.data) throw new Error('QDII Lens 报价数据为空')
  return { ...res.data, code }
}

interface NavRaw {
  valuation_date?: string
  nav?: number
}

/** 基金净值历史（用于跟踪误差） */
export async function fetchNavHistory(code: string): Promise<{ navList: NavPoint[] }> {
  const res = await requestJson<{ data?: NavRaw[] }>(
    'QDII Lens 净值',
    `${QDII_BASE}/funds/${code}/nav-history`
  )
  if (!Array.isArray(res.data)) throw new Error('QDII Lens 净值数据为空')

  const navList: NavPoint[] = []
  for (const item of res.data) {
    if (!item || typeof item.nav !== 'number' || typeof item.valuation_date !== 'string') continue
    navList.push({ date: item.valuation_date, nav: item.nav })
  }
  if (navList.length === 0) throw new Error('QDII Lens 净值数据为空')
  return { navList }
}

interface PremiumRaw {
  trading_date?: string
  indicative_premium_pct?: number | null
  official_nav_premium_pct?: number | null
  close_price?: number | null
  nav?: number | null
  iopv?: number | null
}

/** 基金折溢价历史 */
export async function fetchPremiumHistory(
  code: string,
  range = '1y'
): Promise<{ points: PremiumPoint[] }> {
  const res = await requestJson<{ data?: PremiumRaw[] }>(
    'QDII Lens 溢价历史',
    `${QDII_BASE}/funds/${code}/premium-history`,
    { range }
  )
  if (!Array.isArray(res.data)) throw new Error('QDII Lens 溢价历史数据异常')

  const points: PremiumPoint[] = []
  for (const item of res.data) {
    if (!item || typeof item.trading_date !== 'string') continue
    const premium = typeof item.indicative_premium_pct === 'number'
      ? item.indicative_premium_pct
      : (typeof item.official_nav_premium_pct === 'number' ? item.official_nav_premium_pct : null)
    points.push({
      date: item.trading_date,
      premium,
      closePrice: typeof item.close_price === 'number' ? item.close_price : null,
      nav: typeof item.nav === 'number' ? item.nav : null,
      iopv: typeof item.iopv === 'number' ? item.iopv : null,
    })
  }
  return { points }
}

interface TrendRaw {
  trading_date?: string
  median_indicative_premium_pct?: number | null
  median_official_nav_premium_pct?: number | null
  sample_size?: number
  official_sample_size?: number
}

/** 同指数全部 ETF 的溢价中位数趋势 */
export async function fetchPremiumTrend(
  indexSlug: string,
  days = 90
): Promise<{ points: TrendPoint[] }> {
  const res = await requestJson<{ data?: TrendRaw[] }>(
    'QDII Lens 溢价趋势',
    `${QDII_BASE}/indices/${indexSlug}/premium-trend`,
    { days }
  )
  if (!Array.isArray(res.data)) throw new Error('QDII Lens 溢价趋势数据异常')

  const points: TrendPoint[] = []
  for (const item of res.data) {
    if (!item || typeof item.trading_date !== 'string') continue
    const median = typeof item.median_indicative_premium_pct === 'number'
      ? item.median_indicative_premium_pct
      : (typeof item.median_official_nav_premium_pct === 'number'
        ? item.median_official_nav_premium_pct
        : null)
    if (median === null) continue
    points.push({
      date: item.trading_date,
      median,
      sample: item.sample_size || item.official_sample_size || 0,
    })
  }
  return { points }
}

interface BenchmarkRaw {
  trading_date?: string
  close?: number
}

/** 指数对标海外 ETF 历史收盘价（QQQ / SPY） */
export async function fetchBenchmark(indexSlug: string): Promise<{ klines: ClosePoint[] }> {
  const res = await requestJson<{ data?: { points?: BenchmarkRaw[] } }>(
    'QDII Lens 基准',
    `${QDII_BASE}/indices/${indexSlug}/benchmark`
  )
  const points = res.data && res.data.points
  if (!Array.isArray(points) || points.length === 0) throw new Error('QDII Lens 基准数据为空')

  const klines: ClosePoint[] = []
  for (const point of points) {
    if (!point || typeof point.trading_date !== 'string') continue
    if (typeof point.close !== 'number' || point.close <= 0) continue
    klines.push({ date: point.trading_date, close: point.close })
  }
  return { klines }
}

interface FeeRaw {
  rate_pct?: number
}

/** 管理费 + 托管费合计 */
export async function fetchFundFee(code: string): Promise<{ totalPct: number; fees: FeeRaw[] }> {
  const res = await requestJson<{ data?: { fund?: { fees?: FeeRaw[] } } }>(
    'QDII Lens 基金详情',
    `${QDII_BASE}/funds/${code}`
  )
  const fund = res.data && res.data.fund
  if (!fund) throw new Error('QDII Lens 基金详情数据为空')

  const fees = Array.isArray(fund.fees) ? fund.fees : []
  const totalPct = fees.reduce(
    (sum, fee) => sum + (typeof fee.rate_pct === 'number' ? fee.rate_pct : 0),
    0
  )
  return { totalPct, fees }
}

/* ==================== 申购状态 ==================== */

export const SUB_STATUS_LABELS: Record<string, string> = {
  suspended: '暂停申购',
  limited: '限大额',
  open: '开放',
}

export function pickSubStatus(rules: Array<{ action?: string; status?: string }>): SubStatus | null {
  const rule = rules.find(item => (item.action || '').indexOf('create') >= 0)
  if (!rule || !rule.status) return null
  return { status: rule.status, label: SUB_STATUS_LABELS[rule.status] || '' }
}

/* ==================== 交易时段 ==================== */

export function isTradingHours(): boolean {
  const now = new Date()
  const day = now.getDay()
  if (day === 0 || day === 6) return false
  const t = now.getHours() * 100 + now.getMinutes()
  return (t >= 930 && t <= 1130) || (t >= 1300 && t <= 1500)
}
