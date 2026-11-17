/* ===== 类型 ===== */
type CategoryId = 'length' | 'weight' | 'area' | 'volume' | 'temperature' | 'speed' | 'data'

interface CategoryOption {
  id: CategoryId
  name: string
}

interface UnitDef {
  id: string
  name: string
  factor: number
}

interface UnitGroup {
  id: CategoryId
  name: string
  units: UnitDef[]
  defaultFrom: string
  defaultTo: string
  note: string
  temperature: boolean
}

/* ===== 换算表 ===== */
const CATEGORIES: CategoryOption[] = [
  { id: 'length', name: '长度' },
  { id: 'weight', name: '重量' },
  { id: 'area', name: '面积' },
  { id: 'volume', name: '体积' },
  { id: 'temperature', name: '温度' },
  { id: 'speed', name: '速度' },
  { id: 'data', name: '数据' },
]

const GROUPS: UnitGroup[] = [
  {
    id: 'length',
    name: '长度',
    units: [
      { id: 'mm', name: '毫米', factor: 0.001 },
      { id: 'cm', name: '厘米', factor: 0.01 },
      { id: 'm', name: '米', factor: 1 },
      { id: 'km', name: '千米', factor: 1000 },
      { id: 'inch', name: '英寸', factor: 0.0254 },
      { id: 'foot', name: '英尺', factor: 0.3048 },
      { id: 'yard', name: '码', factor: 0.9144 },
      { id: 'mile', name: '英里', factor: 1609.344 },
      { id: 'li', name: '里', factor: 500 },
      { id: 'chi', name: '尺', factor: 1 / 3 },
      { id: 'cun', name: '寸', factor: 1 / 30 },
    ],
    defaultFrom: 'm',
    defaultTo: 'cm',
    note: '市制按 1 尺 = 1/3 米、1 寸 = 1/30 米、1 里 = 500 米',
    temperature: false,
  },
  {
    id: 'weight',
    name: '重量',
    units: [
      { id: 'g', name: '克', factor: 0.001 },
      { id: 'kg', name: '千克', factor: 1 },
      { id: 't', name: '吨', factor: 1000 },
      { id: 'jin', name: '斤', factor: 0.5 },
      { id: 'liang', name: '两', factor: 0.05 },
      { id: 'lb', name: '磅', factor: 0.45359237 },
      { id: 'oz', name: '盎司', factor: 0.028349523125 },
    ],
    defaultFrom: 'kg',
    defaultTo: 'jin',
    note: '市制按 1 斤 = 500 克、1 两 = 50 克',
    temperature: false,
  },
  {
    id: 'area',
    name: '面积',
    units: [
      { id: 'cm2', name: '平方厘米', factor: 0.0001 },
      { id: 'm2', name: '平方米', factor: 1 },
      { id: 'km2', name: '平方千米', factor: 1000000 },
      { id: 'ha', name: '公顷', factor: 10000 },
      { id: 'mu', name: '亩', factor: 666.6666667 },
      { id: 'ft2', name: '平方英尺', factor: 0.09290304 },
      { id: 'ping', name: '坪', factor: 3.305785 },
    ],
    defaultFrom: 'm2',
    defaultTo: 'mu',
    note: '1 亩 ≈ 666.67 平方米，1 公顷 = 15 亩',
    temperature: false,
  },
  {
    id: 'volume',
    name: '体积',
    units: [
      { id: 'ml', name: '毫升', factor: 0.001 },
      { id: 'l', name: '升', factor: 1 },
      { id: 'm3', name: '立方米', factor: 1000 },
      { id: 'cup', name: '杯', factor: 0.2365882365 },
      { id: 'tbsp', name: '汤匙', factor: 0.0147867648 },
      { id: 'tsp', name: '茶匙', factor: 0.00492892159 },
      { id: 'floz', name: '液体盎司', factor: 0.0295735296 },
      { id: 'gallon', name: '加仑', factor: 3.785411784 },
    ],
    defaultFrom: 'l',
    defaultTo: 'ml',
    note: '杯、汤匙、茶匙、加仑按美制换算',
    temperature: false,
  },
  {
    id: 'temperature',
    name: '温度',
    units: [
      { id: 'c', name: '摄氏度', factor: 1 },
      { id: 'f', name: '华氏度', factor: 1 },
      { id: 'k', name: '开尔文', factor: 1 },
    ],
    defaultFrom: 'c',
    defaultTo: 'f',
    note: '支持负数输入；开尔文 = 摄氏度 + 273.15',
    temperature: true,
  },
  {
    id: 'speed',
    name: '速度',
    units: [
      { id: 'ms', name: '米/秒', factor: 1 },
      { id: 'kmh', name: '千米/时', factor: 1 / 3.6 },
      { id: 'mph', name: '英里/时', factor: 0.44704 },
      { id: 'knot', name: '节', factor: 0.5144444444 },
    ],
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    note: '1 米/秒 = 3.6 千米/时',
    temperature: false,
  },
  {
    id: 'data',
    name: '数据',
    units: [
      { id: 'b', name: 'B', factor: 1 },
      { id: 'kb', name: 'KB', factor: 1024 },
      { id: 'mb', name: 'MB', factor: 1024 * 1024 },
      { id: 'gb', name: 'GB', factor: 1024 * 1024 * 1024 },
      { id: 'tb', name: 'TB', factor: 1024 * 1024 * 1024 * 1024 },
    ],
    defaultFrom: 'gb',
    defaultTo: 'mb',
    note: '按 1024 进制换算，1 GB = 1024 MB',
    temperature: false,
  },
]

/* ===== 工具函数 ===== */
function findGroup(id: CategoryId): UnitGroup {
  const group = GROUPS.filter(item => item.id === id)[0]
  return group || GROUPS[0]
}

function formatValue(value: number): string {
  if (!isFinite(value)) return '—'
  if (Math.abs(value) < 1e-10) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-6) return value.toExponential(4)
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6
  return String(Number(value.toFixed(digits)))
}

function convertValue(group: UnitGroup, from: UnitDef, to: UnitDef, value: number): number {
  if (group.temperature) {
    let celsius = value
    if (from.id === 'f') celsius = ((value - 32) * 5) / 9
    else if (from.id === 'k') celsius = value - 273.15

    if (to.id === 'f') return (celsius * 9) / 5 + 32
    if (to.id === 'k') return celsius + 273.15
    return celsius
  }
  return (value * from.factor) / to.factor
}

function refreshConversion(inst: any) {
  const group = findGroup(inst.data.activeCategory)
  const from = group.units[inst.data.fromUnitIndex] || group.units[0]
  const to = group.units[inst.data.toUnitIndex] || group.units[1]
  const parsed = parseFloat(inst.data.amountText)
  const value = isFinite(parsed) ? parsed : 0
  const result = convertValue(group, from, to, value)
  const resultText = formatValue(result)

  inst.setData({
    fromLabel: from.name,
    toLabel: to.name,
    resultText,
    resultClass:
      resultText.length > 10 ? 'xsmall' : resultText.length > 6 ? 'small' : '',
    oneText: formatValue(convertValue(group, from, to, 1)),
    copyText: `${value} ${from.name} = ${resultText} ${to.name}`,
    note: group.note,
    inputType: group.temperature ? 'text' : 'digit',
    supportsNegative: group.temperature,
  })
}

function applyGroup(inst: any, group: UnitGroup) {
  const fromIndex = group.units.findIndex(unit => unit.id === group.defaultFrom)
  const toIndex = group.units.findIndex(unit => unit.id === group.defaultTo)
  inst.setData({
    activeCategory: group.id,
    unitNames: group.units.map(unit => unit.name),
    fromUnitIndex: fromIndex >= 0 ? fromIndex : 0,
    toUnitIndex: toIndex >= 0 ? toIndex : Math.min(1, group.units.length - 1),
    note: group.note,
    inputType: group.temperature ? 'text' : 'digit',
    supportsNegative: group.temperature,
  })
  refreshConversion(inst)
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
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 100 * rpx)
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
    categories: CATEGORIES,
    activeCategory: 'length' as CategoryId,
    unitNames: [] as string[],
    fromUnitIndex: 0,
    toUnitIndex: 1,
    fromLabel: '',
    toLabel: '',
    amountText: '1',
    resultText: '',
    resultClass: '',
    oneText: '',
    note: '',
    copyText: '',
    inputType: 'digit',
    supportsNegative: false,
    scrollHeight: 0,
  },

  lifetimes: {
    attached() {
      applyGroup(this, findGroup('length'))
    },
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      refreshConversion(this)
      if (this.data.scrollHeight > 0) remeasure(this)
    },
  },

  methods: {
    onCategoryChange(e: WechatMiniprogram.TouchEvent) {
      const id = (e.currentTarget.dataset as { id: CategoryId }).id
      if (!CATEGORIES.some(item => item.id === id)) return
      applyGroup(this, findGroup(id))
    },

    onAmountInput(e: WechatMiniprogram.Input) {
      this.setData({ amountText: e.detail.value })
      refreshConversion(this)
    },

    onAmountBlur() {
      const value = parseFloat(this.data.amountText)
      if (!isFinite(value)) {
        this.setData({ amountText: '0' })
      }
      refreshConversion(this)
    },

    onToggleSign() {
      const text = this.data.amountText.trim()
      const next = text.indexOf('-') === 0 ? text.slice(1) : `-${text || '0'}`
      this.setData({ amountText: next })
      refreshConversion(this)
    },

    onFromUnitChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value)
      const group = findGroup(this.data.activeCategory)
      if (!group.units[index]) return
      this.setData({
        fromUnitIndex: index,
        fromLabel: group.units[index].name,
      })
      refreshConversion(this)
    },

    onToUnitChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value)
      const group = findGroup(this.data.activeCategory)
      if (!group.units[index]) return
      this.setData({
        toUnitIndex: index,
        toLabel: group.units[index].name,
      })
      refreshConversion(this)
    },

    onSwap() {
      this.setData({
        fromUnitIndex: this.data.toUnitIndex,
        fromLabel: this.data.toLabel,
        toUnitIndex: this.data.fromUnitIndex,
        toLabel: this.data.fromLabel,
      })
      refreshConversion(this)
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
        title: '单位换算：市制、英制、温度和厨房单位',
        path: '/pages/unit-convert/unit-convert',
      }
    },
  },
})
