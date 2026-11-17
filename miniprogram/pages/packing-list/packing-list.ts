/* ===== 类型 ===== */
type PackType = 'city' | 'beach' | 'outdoor' | 'business' | 'family'
type Weather = 'hot' | 'mild' | 'cold'
type PackGroupId = 'docs' | 'clothes' | 'toiletries' | 'electronics' | 'meds' | 'misc' | 'custom'

interface TypeOption {
  id: PackType
  name: string
}

interface WeatherOption {
  id: Weather
  name: string
}

interface PackGroupDef {
  id: PackGroupId
  name: string
}

interface PackItem {
  id: string
  name: string
  qty: string
  checked: boolean
  custom: boolean
  groupId: PackGroupId
}

interface PackGroup {
  id: PackGroupId
  name: string
  items: PackItem[]
  packed: number
  total: number
}

interface PackingSettings {
  type: PackType
  days: number
  weather: Weather
}

interface StoredPacking extends PackingSettings {
  items: PackItem[]
}

/* ===== 常量 ===== */
const TYPES: TypeOption[] = [
  { id: 'city', name: '城市' },
  { id: 'beach', name: '海边' },
  { id: 'outdoor', name: '户外' },
  { id: 'business', name: '商务' },
  { id: 'family', name: '探亲' },
]

const WEATHERS: WeatherOption[] = [
  { id: 'hot', name: '炎热' },
  { id: 'mild', name: '温和' },
  { id: 'cold', name: '寒冷' },
]

const GROUPS: PackGroupDef[] = [
  { id: 'custom', name: '自选' },
  { id: 'docs', name: '证件' },
  { id: 'electronics', name: '电子' },
  { id: 'misc', name: '随身' },
  { id: 'clothes', name: '衣物' },
  { id: 'toiletries', name: '洗护' },
  { id: 'meds', name: '药品' },
]

const STORAGE_KEY = 'packing-list:v1'
const MAX_DAYS = 60

/* ===== 工具函数 ===== */
let itemSeq = 0

function newItemId(): string {
  itemSeq += 1
  return `pack-${Date.now()}-${itemSeq}`
}

function typeName(id: PackType): string {
  const found = TYPES.filter(item => item.id === id)[0]
  return found ? found.name : '城市'
}

function weatherName(id: Weather): string {
  const found = WEATHERS.filter(item => item.id === id)[0]
  return found ? found.name : '温和'
}

function clampDays(text: string, fallback: number): number {
  const value = parseInt(text, 10)
  if (isNaN(value)) return fallback
  return Math.min(MAX_DAYS, Math.max(1, value))
}

/* ===== 清单生成 ===== */
function generateItems(settings: PackingSettings): PackItem[] {
  const items: PackItem[] = []
  const seen: Record<string, boolean> = {}
  const days = settings.days
  const clothingDays = Math.min(days, 7)
  const topDays = Math.min(days, 4)

  const add = (groupId: PackGroupId, name: string, qty?: string) => {
    const key = `${groupId}:${name}`
    if (seen[key]) return
    seen[key] = true
    items.push({
      id: newItemId(),
      name,
      qty: qty || '',
      checked: false,
      custom: false,
      groupId,
    })
  }

  // 证件 / 随身
  add('docs', '身份证')
  add('docs', '护照 / 签证（按需）')
  add('docs', '机票 / 车票')
  add('docs', '酒店 / 住址确认')
  add('docs', '现金 / 银行卡')
  add('docs', '钥匙')

  // 电子
  add('electronics', '手机')
  add('electronics', '充电器')
  add('electronics', '充电宝')
  add('electronics', '数据线')
  add('electronics', '耳机')

  // 洗护
  add('toiletries', '牙刷 / 牙膏')
  add('toiletries', '洗面奶')
  add('toiletries', '面霜')
  add('toiletries', '洗发水 / 沐浴露')
  add('toiletries', '梳子')
  add('toiletries', '纸巾 / 湿巾')
  add('toiletries', '口罩')

  // 药品
  add('meds', '常用药')
  add('meds', '感冒药')
  add('meds', '肠胃药')
  add('meds', '创可贴')
  add('meds', '晕车药')
  add('meds', '个人处方药')

  // 衣物
  add('clothes', '内衣裤', `× ${clothingDays}`)
  add('clothes', '袜子', `× ${clothingDays}`)
  add('clothes', '上衣', `× ${topDays}`)
  add('clothes', '裤子', `× ${Math.min(days, 2)}`)
  add('clothes', '睡衣')
  add('clothes', '拖鞋')

  // 天气
  if (settings.weather === 'hot') {
    add('clothes', '短袖', `× ${topDays}`)
    add('clothes', '短裤')
    add('clothes', '遮阳帽')
    add('toiletries', '防晒霜')
    add('misc', '太阳镜')
    add('misc', '驱蚊液')
  } else if (settings.weather === 'cold') {
    add('clothes', '保暖内衣')
    add('clothes', '毛衣')
    add('clothes', '厚外套')
    add('clothes', '围巾')
    add('clothes', '手套')
    add('clothes', '保暖袜')
  } else {
    add('clothes', '长袖')
    add('clothes', '薄外套')
    add('clothes', '长裤')
    add('misc', '雨伞')
  }

  // 行程类型
  if (settings.type === 'city') {
    add('misc', '舒适步行鞋')
    add('misc', '小背包')
    add('misc', '雨伞')
  } else if (settings.type === 'beach') {
    add('clothes', '泳衣')
    add('misc', '沙滩巾')
    add('misc', '人字拖')
    add('misc', '太阳镜')
    add('toiletries', '防晒霜')
    add('misc', '防水袋')
  } else if (settings.type === 'outdoor') {
    add('misc', '登山鞋')
    add('clothes', '冲锋衣')
    add('clothes', '速干衣')
    add('misc', '背包')
    add('misc', '水壶')
    add('misc', '驱蚊液')
    add('misc', '头灯')
  } else if (settings.type === 'business') {
    add('clothes', '正装')
    add('clothes', '衬衫')
    add('misc', '皮鞋')
    add('electronics', '电脑')
    add('misc', '名片')
    add('misc', '文件 / 资料')
  } else {
    add('misc', '给家人的礼物')
    add('misc', '零食')
    add('misc', '保温杯')
  }

  return items
}

function buildGroups(items: PackItem[]): {
  groups: PackGroup[]
  total: number
  packed: number
} {
  const groups: PackGroup[] = []
  let total = 0
  let packed = 0

  GROUPS.forEach(def => {
    const groupItems = items.filter(item => item.groupId === def.id)
    if (groupItems.length === 0) return
    const groupPacked = groupItems.filter(item => item.checked).length
    groups.push({
      id: def.id,
      name: def.name,
      items: groupItems,
      packed: groupPacked,
      total: groupItems.length,
    })
    total += groupItems.length
    packed += groupPacked
  })

  return { groups, total, packed }
}

function applyItems(inst: any, items: PackItem[]) {
  const { groups, total, packed } = buildGroups(items)
  inst.setData({
    items,
    groups,
    totalCount: total,
    packedCount: packed,
    progress: total > 0 ? Math.round((packed / total) * 100) : 0,
  })
}

function applySummary(inst: any) {
  inst.setData({
    summaryText: `${typeName(inst.data.genType)} · ${inst.data.genDays} 天 · ${weatherName(
      inst.data.genWeather
    )}`,
  })
}

function refreshDirty(inst: any) {
  const days = clampDays(inst.data.formDaysText, 0)
  inst.setData({
    settingsDirty:
      inst.data.formType !== inst.data.genType ||
      inst.data.formWeather !== inst.data.genWeather ||
      days !== inst.data.genDays,
  })
}

/* ===== 本地缓存 ===== */
function readStore(): StoredPacking | null {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) return null

    const type = TYPES.some(item => item.id === raw.type) ? (raw.type as PackType) : 'city'
    const weather = WEATHERS.some(item => item.id === raw.weather)
      ? (raw.weather as Weather)
      : 'mild'
    const days = clampDays(String(raw.days || 3), 3)
    const items: PackItem[] = []

    raw.items.forEach((item: any) => {
      if (!item || typeof item.name !== 'string' || !item.name.trim()) return
      const groupId = GROUPS.some(group => group.id === item.groupId)
        ? (item.groupId as PackGroupId)
        : 'custom'
      items.push({
        id: typeof item.id === 'string' ? item.id : newItemId(),
        name: item.name.trim().slice(0, 20),
        qty: typeof item.qty === 'string' ? item.qty : '',
        checked: item.checked === true,
        custom: item.custom === true,
        groupId,
      })
    })

    if (items.length === 0) return null
    return { type, weather, days, items }
  } catch (err) {
    console.warn('读取打包清单失败', err)
    return null
  }
}

function persistStore(inst: any) {
  const data: StoredPacking = {
    type: inst.data.genType,
    days: inst.data.genDays,
    weather: inst.data.genWeather,
    items: inst.data.items,
  }
  try {
    wx.setStorageSync(STORAGE_KEY, data)
  } catch (err) {
    console.warn('保存打包清单失败', err)
  }
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
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 140 * rpx)
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
    types: TYPES,
    weathers: WEATHERS,
    formType: 'city' as PackType,
    formDaysText: '3',
    formWeather: 'mild' as Weather,
    genType: 'city' as PackType,
    genDays: 3,
    genWeather: 'mild' as Weather,
    summaryText: '',
    settingsDirty: false,

    items: [] as PackItem[],
    groups: [] as PackGroup[],
    totalCount: 0,
    packedCount: 0,
    progress: 0,
    customText: '',
    scrollHeight: 0,
  },

  lifetimes: {
    attached() {
      let settings: PackingSettings
      let items: PackItem[]
      const stored = readStore()

      if (stored) {
        settings = {
          type: stored.type,
          days: stored.days,
          weather: stored.weather,
        }
        items = stored.items
      } else {
        settings = { type: 'city', days: 3, weather: 'mild' }
        items = generateItems(settings)
      }

      this.setData({
        formType: settings.type,
        formDaysText: String(settings.days),
        formWeather: settings.weather,
        genType: settings.type,
        genDays: settings.days,
        genWeather: settings.weather,
        settingsDirty: false,
      })
      applyItems(this, items)
      applySummary(this)

      if (!stored) persistStore(this)
    },
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      if (this.data.scrollHeight > 0) remeasure(this)
    },
  },

  methods: {
    onTypeChange(e: WechatMiniprogram.TouchEvent) {
      const type = (e.currentTarget.dataset as { id: PackType }).id
      if (!TYPES.some(item => item.id === type)) return
      this.setData({ formType: type })
      refreshDirty(this)
    },

    onWeatherChange(e: WechatMiniprogram.TouchEvent) {
      const weather = (e.currentTarget.dataset as { id: Weather }).id
      if (!WEATHERS.some(item => item.id === weather)) return
      this.setData({ formWeather: weather })
      refreshDirty(this)
    },

    onDaysInput(e: WechatMiniprogram.Input) {
      this.setData({ formDaysText: e.detail.value })
      refreshDirty(this)
    },

    onDaysBlur() {
      const days = clampDays(this.data.formDaysText, 1)
      this.setData({ formDaysText: String(days) })
      refreshDirty(this)
    },

    onGenerate() {
      if (this.data.packedCount > 0) {
        wx.showModal({
          title: '重新生成',
          content: '重新生成会清空当前所有勾选，确定吗？',
          confirmColor: '#F76707',
          success: res => {
            if (!res.confirm) return
            this.runGenerate()
          },
        })
        return
      }
      this.runGenerate()
    },

    runGenerate() {
      const days = clampDays(this.data.formDaysText, 1)
      const settings: PackingSettings = {
        type: this.data.formType,
        days,
        weather: this.data.formWeather,
      }
      const items = generateItems(settings)

      this.setData({
        formDaysText: String(days),
        genType: settings.type,
        genDays: settings.days,
        genWeather: settings.weather,
        settingsDirty: false,
      })
      applyItems(this, items)
      applySummary(this)
      persistStore(this)
      wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: '清单已生成', icon: 'none', duration: 1200 })
    },

    onToggleItem(e: WechatMiniprogram.TouchEvent) {
      const id = String((e.currentTarget.dataset as { id: string }).id)
      const items = this.data.items.map(item => {
        if (item.id !== id) return item
        return {
          id: item.id,
          name: item.name,
          qty: item.qty,
          checked: !item.checked,
          custom: item.custom,
          groupId: item.groupId,
        }
      })
      applyItems(this, items)
      persistStore(this)
    },

    onCustomInput(e: WechatMiniprogram.Input) {
      this.setData({ customText: e.detail.value })
    },

    onAddCustom() {
      const name = this.data.customText.trim()
      if (!name) {
        wx.showToast({ title: '先写下要带的物品', icon: 'none', duration: 1500 })
        return
      }
      if (name.length > 20) {
        wx.showToast({ title: '物品名最多 20 个字', icon: 'none', duration: 1500 })
        return
      }
      if (this.data.items.some(item => item.name === name)) {
        wx.showToast({ title: '清单里已经有这个了', icon: 'none', duration: 1500 })
        return
      }

      const item: PackItem = {
        id: newItemId(),
        name,
        qty: '',
        checked: false,
        custom: true,
        groupId: 'custom',
      }
      applyItems(this, this.data.items.concat(item))
      persistStore(this)
      this.setData({ customText: '' })
      wx.showToast({ title: '已添加', icon: 'success', duration: 1000 })
    },

    onDeleteCustom(e: WechatMiniprogram.TouchEvent) {
      const id = String((e.currentTarget.dataset as { id: string }).id)
      const item = this.data.items.filter(entry => entry.id === id && entry.custom)[0]
      if (!item) return

      wx.showModal({
        title: '删除物品',
        content: `确定从清单中删除「${item.name}」吗？`,
        confirmColor: '#F76707',
        success: res => {
          if (!res.confirm) return
          applyItems(
            this,
            this.data.items.filter(entry => entry.id !== id)
          )
          persistStore(this)
        },
      })
    },

    onCopyList() {
      const lines: string[] = []
      this.data.groups.forEach(group => {
        lines.push(`【${group.name}】`)
        group.items.forEach(item => {
          lines.push(`${item.checked ? '✓' : '□'} ${item.name}${item.qty ? ` ${item.qty}` : ''}`)
        })
      })
      if (lines.length === 0) return

      wx.setClipboardData({
        data: lines.join('\n'),
        success: () => {
          wx.showToast({ title: '清单已复制', icon: 'none', duration: 1000 })
        },
      })
    },

    onShareAppMessage() {
      return {
        title: '旅行打包清单：按行程和天气生成，勾选不遗漏',
        path: '/pages/packing-list/packing-list',
      }
    },
  },
})
