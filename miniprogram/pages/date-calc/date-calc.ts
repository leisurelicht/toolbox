/* ===== 类型 ===== */
type DateMode = 'diff' | 'add' | 'countdown' | 'shelf'
type Direction = 'after' | 'before'
type AddUnit = 'day' | 'week' | 'month' | 'year' | 'workday'
type ShelfUnit = 'day' | 'month' | 'year'
type DateStatus = 'future' | 'today' | 'past'

interface ModeOption {
  id: DateMode
  name: string
}

interface UnitOption<T extends string> {
  id: T
  name: string
}

interface StoredEvent {
  id: number
  title: string
  date: string
  repeatYearly: boolean
}

interface EventView extends StoredEvent {
  yearText: string
  mdText: string
  weekday: string
  daysText: string
  status: DateStatus
  diff: number
}

interface ShelfPreset {
  label: string
  amount: number
  unit: ShelfUnit
}

/* ===== 常量 ===== */
const MODES: ModeOption[] = [
  { id: 'diff', name: '日期差' },
  { id: 'add', name: '推算' },
  { id: 'countdown', name: '倒数日' },
  { id: 'shelf', name: '保质期' },
]

const ADD_UNITS: Array<UnitOption<AddUnit>> = [
  { id: 'day', name: '天' },
  { id: 'week', name: '周' },
  { id: 'month', name: '月' },
  { id: 'year', name: '年' },
  { id: 'workday', name: '工作日' },
]

const SHELF_UNITS: Array<UnitOption<ShelfUnit>> = [
  { id: 'day', name: '天' },
  { id: 'month', name: '月' },
  { id: 'year', name: '年' },
]

const SHELF_PRESETS: ShelfPreset[] = [
  { label: '7 天', amount: 7, unit: 'day' },
  { label: '30 天', amount: 30, unit: 'day' },
  { label: '90 天', amount: 90, unit: 'day' },
  { label: '180 天', amount: 180, unit: 'day' },
  { label: '1 年', amount: 1, unit: 'year' },
]

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const STORAGE_KEY = 'date-calc:events:v1'
const MAX_EVENTS = 50
const DAY_MS = 24 * 60 * 60 * 1000

/* ===== 日期工具 ===== */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function parseDate(value: string): Date | null {
  if (!value || value.length !== 10) return null
  const parts = value.split('-')
  if (parts.length !== 3) return null
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function todayStr(): string {
  return formatDate(new Date())
}

function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

function addDays(date: Date, days: number): Date {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + days * DAY_MS
  )
  return new Date(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
}

function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), lastDay)
  )
}

function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12)
}

function addWorkdays(date: Date, amount: number): Date {
  let result = date
  let remaining = Math.abs(amount)
  const step = amount >= 0 ? 1 : -1
  let guard = 0
  while (remaining > 0 && guard < 40000) {
    result = addDays(result, step)
    const weekday = result.getDay()
    if (weekday !== 0 && weekday !== 6) remaining -= 1
    guard += 1
  }
  return result
}

function addByUnit(date: Date, amount: number, unit: AddUnit): Date {
  if (unit === 'day') return addDays(date, amount)
  if (unit === 'week') return addDays(date, amount * 7)
  if (unit === 'month') return addMonths(date, amount)
  if (unit === 'year') return addYears(date, amount)
  return addWorkdays(date, amount)
}

function calendarBreakdown(start: Date, end: Date): { years: number; months: number; days: number } {
  let from = start
  let to = end
  if (dayNumber(to) < dayNumber(from)) {
    const temp = from
    from = to
    to = temp
  }

  let years = to.getFullYear() - from.getFullYear()
  let cursor = addYears(from, years)
  if (dayNumber(cursor) > dayNumber(to)) {
    years -= 1
    cursor = addYears(from, years)
  }

  let months = 0
  while (months < 12) {
    const next = addMonths(cursor, 1)
    if (dayNumber(next) > dayNumber(to)) break
    cursor = next
    months += 1
  }

  return {
    years,
    months,
    days: dayNumber(to) - dayNumber(cursor),
  }
}

function countRange(start: Date, end: Date): { weekdays: number; weekends: number } {
  let from = start
  let to = end
  if (dayNumber(to) < dayNumber(from)) {
    const temp = from
    from = to
    to = temp
  }

  const total = dayNumber(to) - dayNumber(from)
  const fullWeeks = Math.floor(total / 7)
  let weekdays = fullWeeks * 5
  let weekends = fullWeeks * 2
  const rest = total % 7

  for (let i = 0; i < rest; i += 1) {
    const weekday = (from.getDay() + i) % 7
    if (weekday === 0 || weekday === 6) weekends += 1
    else weekdays += 1
  }

  return { weekdays, weekends }
}

function unitName<T extends string>(units: Array<UnitOption<T>>, id: T): string {
  const found = units.filter(item => item.id === id)[0]
  return found ? found.name : ''
}

function relativeMeta(target: Date, today: Date): string {
  const diff = dayNumber(target) - dayNumber(today)
  if (diff > 0) return `${diff} 天后`
  if (diff < 0) return `${-diff} 天前`
  return '就是今天'
}

/* ===== 倒数日存储 ===== */
let eventSeq = 0

function newEventId(): number {
  eventSeq += 1
  return Date.now() + eventSeq
}

function yearlyOccurrence(date: Date, today: Date): Date {
  // 首次日期还没到，就按首次日期算，不要跳到“今年/明年”
  if (dayNumber(date) >= dayNumber(today)) return date

  const build = (year: number): Date => {
    const lastDay = new Date(year, date.getMonth() + 1, 0).getDate()
    return new Date(year, date.getMonth(), Math.min(date.getDate(), lastDay))
  }
  let candidate = build(today.getFullYear())
  if (dayNumber(candidate) < dayNumber(today)) {
    candidate = build(today.getFullYear() + 1)
  }
  return candidate
}

function buildEventViews(raw: StoredEvent[], today: Date): EventView[] {
  const views: EventView[] = []
  raw.forEach(event => {
    const storedDate = parseDate(event.date)
    if (!storedDate) return
    const date = event.repeatYearly ? yearlyOccurrence(storedDate, today) : storedDate
    const diff = dayNumber(date) - dayNumber(today)
    let status: DateStatus = 'future'
    if (diff === 0) status = 'today'
    else if (diff < 0) status = 'past'

    views.push({
      id: event.id,
      title: event.title,
      date: event.date,
      repeatYearly: event.repeatYearly,
      yearText: event.repeatYearly ? '每年' : String(date.getFullYear()),
      mdText: `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
      weekday: weekdayName(date),
      daysText: diff > 0 ? `还有 ${diff} 天` : diff === 0 ? '就是今天' : `已过 ${-diff} 天`,
      status,
      diff,
    })
  })

  views.sort((a, b) => {
    if (a.diff >= 0 && b.diff >= 0) return a.diff - b.diff
    if (a.diff < 0 && b.diff < 0) return b.diff - a.diff
    return a.diff >= 0 ? -1 : 1
  })
  return views
}

function readEvents(): StoredEvent[] {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (!Array.isArray(raw)) return []
    const events: StoredEvent[] = []
    raw.forEach((item: any) => {
      if (!item || typeof item.title !== 'string' || typeof item.date !== 'string') return
      if (!item.title.trim() || !parseDate(item.date)) return
      events.push({
        id: typeof item.id === 'number' ? item.id : newEventId(),
        title: item.title.trim().slice(0, 20),
        date: item.date,
        repeatYearly: item.repeatYearly === true,
      })
    })
    return events.slice(0, MAX_EVENTS)
  } catch (err) {
    console.warn('读取倒数日失败', err)
    return []
  }
}

function persistEvents(inst: any) {
  const raw = (inst.data.events as EventView[]).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    repeatYearly: event.repeatYearly,
  }))
  try {
    wx.setStorageSync(STORAGE_KEY, raw)
  } catch (err) {
    console.warn('保存倒数日失败', err)
  }
}

function refreshEvents(inst: any) {
  const today = parseDate(todayStr())
  if (!today) return
  const raw = (inst.data.events as EventView[]).map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    repeatYearly: event.repeatYearly,
  }))
  inst.setData({ events: buildEventViews(raw, today) })
}

/* ===== 各模式结果计算 ===== */
function refreshDiff(inst: any) {
  const start = parseDate(inst.data.startDate)
  const end = parseDate(inst.data.endDate)
  if (!start || !end) return

  const startNumber = dayNumber(start)
  const endNumber = dayNumber(end)
  const earlier = startNumber <= endNumber ? start : end
  const later = startNumber <= endNumber ? end : start
  const effectiveEnd = inst.data.diffIncludeEnd ? addDays(later, 1) : later
  const total = dayNumber(effectiveEnd) - dayNumber(earlier)
  const weeks = Math.floor(total / 7)
  const rest = total % 7

  const breakdown = calendarBreakdown(earlier, effectiveEnd)
  const counts = countRange(earlier, effectiveEnd)

  const calendarParts: string[] = []
  if (breakdown.years > 0) calendarParts.push(`${breakdown.years} 年`)
  if (breakdown.months > 0) calendarParts.push(`${breakdown.months} 个月`)
  if (breakdown.days > 0 || calendarParts.length === 0) {
    calendarParts.push(`${breakdown.days} 天`)
  }

  const weeksText =
    total >= 7 ? (rest > 0 ? `${weeks} 周 ${rest} 天` : `${weeks} 周`) : `${total} 天`

  inst.setData({
    diffTotal: total,
    diffWeeksText: weeksText,
    diffCalendarText: calendarParts.join(' '),
    diffWorkText: `工作日 ${counts.weekdays} 天 · 周末 ${counts.weekends} 天`,
    diffHint: startNumber > endNumber ? '结束日期早于开始日期，已按较早 → 较晚计算' : '',
    diffCopyText: `${inst.data.startDate} → ${inst.data.endDate}，${
      inst.data.diffIncludeEnd ? '含' : '不含'
    }结束日共 ${total} 天`,
  })
}

function refreshAdd(inst: any) {
  const base = parseDate(inst.data.baseDate)
  if (!base) return

  const amount = Number(inst.data.addAmount) || 0
  const signed = inst.data.addDirection === 'before' ? -amount : amount
  const result = addByUnit(base, signed, inst.data.addUnit)
  const today = parseDate(todayStr())
  const directionText = inst.data.addDirection === 'before' ? '往前' : '往后'
  const name = unitName(ADD_UNITS, inst.data.addUnit as AddUnit)

  inst.setData({
    addResultDate: formatDate(result),
    addResultWeekday: weekdayName(result),
    addResultMeta: today ? relativeMeta(result, today) : '',
    addResultHint:
      inst.data.addUnit === 'workday' ? '已跳过周六日，不含法定节假日' : '',
    addCopyText: `${inst.data.baseDate} ${directionText} ${amount} ${name} → ${formatDate(result)}`,
  })
}

function refreshShelf(inst: any) {
  const production = parseDate(inst.data.shelfDate)
  if (!production) return

  const amount = Number(inst.data.shelfAmount) || 0
  const unit = inst.data.shelfUnit as ShelfUnit
  let expiry: Date
  if (unit === 'month') expiry = addMonths(production, amount)
  else if (unit === 'year') expiry = addYears(production, amount)
  else expiry = addDays(production, amount)

  const today = parseDate(todayStr())
  const todayNumber = today ? dayNumber(today) : dayNumber(production)
  const left = dayNumber(expiry) - todayNumber
  const total = dayNumber(expiry) - dayNumber(production)
  const elapsed = todayNumber - dayNumber(production)
  const progress =
    total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  const status: DateStatus = left > 0 ? 'future' : left === 0 ? 'today' : 'past'
  const statusText =
    left > 0 ? `还剩 ${left} 天` : left === 0 ? '今天到期' : `已过期 ${-left} 天`
  const name = unitName(SHELF_UNITS, unit)

  inst.setData({
    shelfExpiryText: formatDate(expiry),
    shelfExpiryWeekday: weekdayName(expiry),
    shelfStatusText: statusText,
    shelfStatus: status,
    shelfProgress: progress,
    shelfCopyText: `${inst.data.shelfDate} 生产，保质期 ${amount} ${name}，到期日 ${formatDate(
      expiry
    )}`,
  })
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
      // 兜底估算：导航栏约 44px + 状态栏 + Tab 栏约 116rpx
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
    modes: MODES,
    addUnits: ADD_UNITS,
    shelfUnits: SHELF_UNITS,
    shelfPresets: SHELF_PRESETS,
    activeMode: 'diff' as DateMode,
    scrollHeight: 0,
    scrollIntoView: 'top-diff',
    todayText: '',

    /* 日期差 */
    startDate: '',
    endDate: '',
    startWeekday: '',
    endWeekday: '',
    diffIncludeEnd: false,
    diffTotal: 0,
    diffWeeksText: '',
    diffCalendarText: '',
    diffWorkText: '',
    diffHint: '',
    diffCopyText: '',

    /* 推算 */
    baseDate: '',
    baseWeekday: '',
    addDirection: 'after' as Direction,
    addAmount: 7,
    addAmountText: '7',
    addUnit: 'day' as AddUnit,
    addResultDate: '',
    addResultWeekday: '',
    addResultMeta: '',
    addResultHint: '',
    addCopyText: '',

    /* 倒数日 */
    eventTitle: '',
    eventDate: '',
    eventDateWeekday: '',
    eventRepeat: false,
    events: [] as EventView[],

    /* 保质期 */
    shelfDate: '',
    shelfWeekday: '',
    shelfAmount: 180,
    shelfAmountText: '180',
    shelfUnit: 'day' as ShelfUnit,
    shelfExpiryText: '',
    shelfExpiryWeekday: '',
    shelfStatusText: '',
    shelfStatus: 'future' as DateStatus,
    shelfProgress: 0,
    shelfCopyText: '',
  },

  lifetimes: {
    attached() {
      const today = parseDate(todayStr())
      if (!today) return
      const end = addDays(today, 7)
      const events = buildEventViews(readEvents(), today)

      this.setData({
        todayText: formatDate(today),
        startDate: formatDate(today),
        startWeekday: weekdayName(today),
        endDate: formatDate(end),
        endWeekday: weekdayName(end),
        baseDate: formatDate(today),
        baseWeekday: weekdayName(today),
        eventDate: formatDate(today),
        eventDateWeekday: weekdayName(today),
        shelfDate: formatDate(today),
        shelfWeekday: weekdayName(today),
        events,
      })

      refreshDiff(this)
      refreshAdd(this)
      refreshShelf(this)
    },
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      const today = parseDate(todayStr())
      if (!today) return
      this.setData({ todayText: formatDate(today) })
      refreshDiff(this)
      refreshAdd(this)
      refreshShelf(this)
      refreshEvents(this)
      if (this.data.scrollHeight > 0) remeasure(this)
    },
  },

  methods: {
    /* ========== 模式切换 ========== */
    onModeChange(e: WechatMiniprogram.TouchEvent) {
      const mode = (e.currentTarget.dataset as { id: DateMode }).id
      if (mode === this.data.activeMode) return
      this.setData({
        activeMode: mode,
        scrollIntoView: `top-${mode}`,
      })
      if (mode === 'diff') refreshDiff(this)
      else if (mode === 'add') refreshAdd(this)
      else if (mode === 'countdown') refreshEvents(this)
      else refreshShelf(this)
    },

    /* ========== 日期差 ========== */
    onStartDateChange(e: WechatMiniprogram.PickerChange) {
      const value = String(e.detail.value)
      const date = parseDate(value)
      if (!date) return
      this.setData({ startDate: value, startWeekday: weekdayName(date) })
      refreshDiff(this)
    },

    onEndDateChange(e: WechatMiniprogram.PickerChange) {
      const value = String(e.detail.value)
      const date = parseDate(value)
      if (!date) return
      this.setData({ endDate: value, endWeekday: weekdayName(date) })
      refreshDiff(this)
    },

    onSwapDates() {
      this.setData({
        startDate: this.data.endDate,
        startWeekday: this.data.endWeekday,
        endDate: this.data.startDate,
        endWeekday: this.data.startWeekday,
      })
      refreshDiff(this)
    },

    onToggleIncludeEnd() {
      this.setData({ diffIncludeEnd: !this.data.diffIncludeEnd })
      refreshDiff(this)
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

    /* ========== 日期推算 ========== */
    onBaseDateChange(e: WechatMiniprogram.PickerChange) {
      const value = String(e.detail.value)
      const date = parseDate(value)
      if (!date) return
      this.setData({ baseDate: value, baseWeekday: weekdayName(date) })
      refreshAdd(this)
    },

    onDirectionChange(e: WechatMiniprogram.TouchEvent) {
      const direction = (e.currentTarget.dataset as { id: Direction }).id
      if (direction !== 'after' && direction !== 'before') return
      this.setData({ addDirection: direction })
      refreshAdd(this)
    },

    onAddAmountInput(e: WechatMiniprogram.Input) {
      const text = e.detail.value
      const parsed = parseInt(text, 10)
      const amount = isNaN(parsed) ? 0 : Math.min(9999, Math.max(0, parsed))
      this.setData({ addAmountText: text, addAmount: amount })
      refreshAdd(this)
    },

    onAddAmountBlur() {
      this.setData({ addAmountText: String(this.data.addAmount) })
      refreshAdd(this)
    },

    onAddUnitChange(e: WechatMiniprogram.TouchEvent) {
      const unit = (e.currentTarget.dataset as { id: AddUnit }).id
      if (!ADD_UNITS.some(item => item.id === unit)) return
      this.setData({ addUnit: unit })
      refreshAdd(this)
    },

    /* ========== 倒数日 ========== */
    onEventTitleInput(e: WechatMiniprogram.Input) {
      this.setData({ eventTitle: e.detail.value })
    },

    onEventDateChange(e: WechatMiniprogram.PickerChange) {
      const value = String(e.detail.value)
      const date = parseDate(value)
      if (!date) return
      this.setData({ eventDate: value, eventDateWeekday: weekdayName(date) })
    },

    onToggleEventRepeat() {
      this.setData({ eventRepeat: !this.data.eventRepeat })
    },

    onAddEvent() {
      const title = this.data.eventTitle.trim()
      if (!title) {
        wx.showToast({ title: '先写下要纪念的事', icon: 'none', duration: 1500 })
        return
      }
      if (title.length > 20) {
        wx.showToast({ title: '标题最多 20 个字', icon: 'none', duration: 1500 })
        return
      }
      const today = parseDate(todayStr())
      if (!today || !parseDate(this.data.eventDate)) return

      const raw = (this.data.events as EventView[]).map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        repeatYearly: event.repeatYearly,
      }))
      raw.push({
        id: newEventId(),
        title,
        date: this.data.eventDate,
        repeatYearly: this.data.eventRepeat,
      })
      const trimmed = raw.length > MAX_EVENTS ? raw.slice(raw.length - MAX_EVENTS) : raw
      const events = buildEventViews(trimmed, today)

      this.setData({
        events,
        eventTitle: '',
        eventDate: formatDate(today),
        eventDateWeekday: weekdayName(today),
        eventRepeat: false,
      })
      persistEvents(this)
      wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: '已添加', icon: 'success', duration: 1000 })
    },

    onDeleteEvent(e: WechatMiniprogram.TouchEvent) {
      const id = Number((e.currentTarget.dataset as { id: number | string }).id)
      const event = this.data.events.filter(item => item.id === id)[0]
      if (!event) return

      wx.showModal({
        title: '删除倒数日',
        content: `确定删除「${event.title}」吗？`,
        confirmColor: '#F76707',
        success: res => {
          if (!res.confirm) return
          this.setData({
            events: this.data.events.filter(item => item.id !== id),
          })
          persistEvents(this)
        },
      })
    },

    /* ========== 保质期 ========== */
    onShelfDateChange(e: WechatMiniprogram.PickerChange) {
      const value = String(e.detail.value)
      const date = parseDate(value)
      if (!date) return
      this.setData({ shelfDate: value, shelfWeekday: weekdayName(date) })
      refreshShelf(this)
    },

    onShelfAmountInput(e: WechatMiniprogram.Input) {
      const text = e.detail.value
      const parsed = parseInt(text, 10)
      const amount = isNaN(parsed) ? 0 : Math.min(9999, Math.max(0, parsed))
      this.setData({ shelfAmountText: text, shelfAmount: amount })
      refreshShelf(this)
    },

    onShelfAmountBlur() {
      this.setData({ shelfAmountText: String(this.data.shelfAmount) })
      refreshShelf(this)
    },

    onShelfUnitChange(e: WechatMiniprogram.TouchEvent) {
      const unit = (e.currentTarget.dataset as { id: ShelfUnit }).id
      if (!SHELF_UNITS.some(item => item.id === unit)) return
      this.setData({ shelfUnit: unit })
      refreshShelf(this)
    },

    onShelfPreset(e: WechatMiniprogram.TouchEvent) {
      const amount = Number((e.currentTarget.dataset as { amount: number | string }).amount)
      const unit = (e.currentTarget.dataset as { unit: ShelfUnit }).unit
      if (!amount || !SHELF_UNITS.some(item => item.id === unit)) return
      this.setData({
        shelfAmount: amount,
        shelfAmountText: String(amount),
        shelfUnit: unit,
      })
      refreshShelf(this)
    },

    /* ========== 分享 ========== */
    onShareAppMessage() {
      return {
        title: '日期计算：日期差、推算、倒数日和保质期',
        path: '/pages/date-calc/date-calc',
      }
    },
  },
})
