/* ===== 类型 ===== */
type MealId = 'breakfast' | 'lunch' | 'dinner' | 'lateNight'

interface Dish {
  id: string
  name: string
  meals: MealId[]
  category: string
  custom: boolean
}

interface HistoryEntry {
  id: number
  dishId: string
  name: string
  ts: number
  timeLabel: string
}

interface StoredData {
  customDishes: Dish[]
  removedPresetIds: string[]
  history: HistoryEntry[]
  noRepeat: boolean
  shakeEnabled: boolean
}

interface PoolResult {
  pool: Dish[]
  fallback: boolean
}

/* ===== 常量 ===== */
const MEALS: Array<{ id: MealId; name: string }> = [
  { id: 'breakfast', name: '早餐' },
  { id: 'lunch', name: '午餐' },
  { id: 'dinner', name: '晚餐' },
  { id: 'lateNight', name: '夜宵' },
]

const ALL_MEALS: MealId[] = ['breakfast', 'lunch', 'dinner', 'lateNight']

const CATEGORIES: Array<{ id: string; name: string }> = [
  { id: 'all', name: '全部' },
  { id: 'rice', name: '米饭' },
  { id: 'noodle', name: '面食' },
  { id: 'fastfood', name: '快餐' },
  { id: 'hotpot', name: '火锅烧烤' },
  { id: 'light', name: '轻食' },
  { id: 'soup', name: '汤粥' },
  { id: 'snack', name: '小吃' },
  { id: 'custom', name: '自定义' },
]

const STORAGE_KEY = 'what-to-eat:v1'
const NO_REPEAT_MS = 3 * 24 * 60 * 60 * 1000
const MAX_HISTORY = 20
const PK_LIMIT = 8
const ROLL_STEPS = 10
const ROLL_INTERVAL = 50

/* ===== 内置菜库 ===== */
function preset(id: string, name: string, meals: MealId[], category: string): Dish {
  return { id, name, meals, category, custom: false }
}

const PRESET_DISHES: Dish[] = [
  preset('p01', '豆浆油条', ['breakfast'], 'snack'),
  preset('p02', '小笼包', ['breakfast'], 'snack'),
  preset('p03', '煎饼果子', ['breakfast'], 'snack'),
  preset('p04', '皮蛋瘦肉粥', ['breakfast'], 'soup'),
  preset('p05', '肠粉', ['breakfast'], 'snack'),
  preset('p06', '热干面', ['breakfast', 'lunch'], 'noodle'),
  preset('p07', '三明治', ['breakfast', 'lunch'], 'fastfood'),
  preset('p08', '燕麦牛奶', ['breakfast'], 'light'),
  preset('p09', '包子', ['breakfast'], 'snack'),
  preset('p10', '馄饨', ['breakfast', 'lunch', 'lateNight'], 'soup'),
  preset('p11', '牛肉面', ['breakfast', 'lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p12', '兰州拉面', ['lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p13', '番茄鸡蛋面', ['lunch', 'dinner'], 'noodle'),
  preset('p14', '重庆小面', ['breakfast', 'lunch'], 'noodle'),
  preset('p15', '酸辣粉', ['lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p16', '螺蛳粉', ['lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p17', '过桥米线', ['lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p18', '饺子', ['lunch', 'dinner', 'lateNight'], 'noodle'),
  preset('p19', '煎饺', ['lunch', 'lateNight'], 'snack'),
  preset('p20', '黄焖鸡米饭', ['lunch', 'dinner'], 'rice'),
  preset('p21', '盖浇饭', ['lunch', 'dinner'], 'rice'),
  preset('p22', '煲仔饭', ['lunch', 'dinner'], 'rice'),
  preset('p23', '蛋炒饭', ['lunch', 'dinner', 'lateNight'], 'rice'),
  preset('p24', '卤肉饭', ['lunch', 'dinner'], 'rice'),
  preset('p25', '猪脚饭', ['lunch', 'dinner'], 'rice'),
  preset('p26', '咖喱饭', ['lunch', 'dinner'], 'rice'),
  preset('p27', '石锅拌饭', ['lunch', 'dinner'], 'rice'),
  preset('p28', '麻辣烫', ['lunch', 'dinner', 'lateNight'], 'hotpot'),
  preset('p29', '冒菜', ['lunch', 'dinner', 'lateNight'], 'hotpot'),
  preset('p30', '麻辣香锅', ['lunch', 'dinner'], 'hotpot'),
  preset('p31', '火锅', ['dinner', 'lateNight'], 'hotpot'),
  preset('p32', '串串香', ['dinner', 'lateNight'], 'hotpot'),
  preset('p33', '烤肉', ['dinner', 'lateNight'], 'hotpot'),
  preset('p34', '烧烤', ['dinner', 'lateNight'], 'hotpot'),
  preset('p35', '水煮肉片', ['lunch', 'dinner'], 'rice'),
  preset('p36', '宫保鸡丁', ['lunch', 'dinner'], 'rice'),
  preset('p37', '鱼香肉丝', ['lunch', 'dinner'], 'rice'),
  preset('p38', '麻婆豆腐', ['lunch', 'dinner'], 'rice'),
  preset('p39', '小炒肉', ['lunch', 'dinner'], 'rice'),
  preset('p40', '酸菜鱼', ['lunch', 'dinner'], 'rice'),
  preset('p41', '汉堡', ['lunch', 'dinner', 'lateNight'], 'fastfood'),
  preset('p42', '炸鸡', ['lunch', 'dinner', 'lateNight'], 'fastfood'),
  preset('p43', '披萨', ['lunch', 'dinner'], 'fastfood'),
  preset('p44', '寿司', ['lunch', 'dinner'], 'fastfood'),
  preset('p45', '沙拉', ['lunch', 'dinner'], 'light'),
  preset('p46', '轻食碗', ['lunch', 'dinner'], 'light'),
  preset('p47', '关东煮', ['lunch', 'lateNight'], 'snack'),
  preset('p48', '潮汕牛肉锅', ['dinner', 'lateNight'], 'hotpot'),
  preset('p49', '羊肉汤', ['breakfast', 'lunch', 'dinner', 'lateNight'], 'soup'),
  preset('p50', '胡辣汤', ['breakfast'], 'soup'),
]

/* ===== 工具函数 ===== */
let customSeq = 0

function newDishId(): string {
  customSeq += 1
  return `custom-${Date.now()}-${customSeq}`
}

function categoryName(id: string): string {
  const found = CATEGORIES.filter(c => c.id === id)[0]
  return found ? found.name : '其他'
}

function mealLabel(meals: MealId[]): string {
  const names = MEALS.filter(m => meals.indexOf(m.id) >= 0).map(m => m.name)
  return names.length > 0 ? names.join(' / ') : '全天'
}

function dishMeta(dish: Dish): string {
  return `${categoryName(dish.category)} · ${mealLabel(dish.meals)}`
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function timeLabel(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const clock = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (ts >= todayStart) return `今天 ${clock}`
  if (ts >= todayStart - 24 * 60 * 60 * 1000) return `昨天 ${clock}`
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${clock}`
}

function currentMeal(): MealId {
  const hour = new Date().getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'lateNight'
}

function buildAllDishes(customDishes: Dish[], removedPresetIds: string[]): Dish[] {
  const presets = PRESET_DISHES.filter(d => removedPresetIds.indexOf(d.id) < 0)
  return presets.concat(customDishes)
}

function filterDishes(dishes: Dish[], meal: MealId, category: string): Dish[] {
  return dishes.filter(d => {
    const matchMeal = d.meals.indexOf(meal) >= 0
    const matchCategory = category === 'all' || d.category === category
    return matchMeal && matchCategory
  })
}

function buildPool(data: any): PoolResult {
  const base = filterDishes(
    data.allDishes as Dish[],
    data.activeMeal as MealId,
    data.activeCategory as string
  )
  if (!data.noRepeat) return { pool: base, fallback: false }

  const now = Date.now()
  const blocked: Record<string, boolean> = {}
  const history = data.history as HistoryEntry[]
  history.forEach(entry => {
    if (now - entry.ts < NO_REPEAT_MS) blocked[entry.dishId] = true
  })

  const fresh = base.filter(d => !blocked[d.id])
  // 近期菜都吃过了就放开限制，避免候选池为空
  if (fresh.length === 0 && base.length > 0) return { pool: base, fallback: true }
  return { pool: fresh, fallback: false }
}

function refreshPool(inst: any) {
  const { pool, fallback } = buildPool(inst.data)
  inst.setData({
    poolCount: pool.length,
    poolHint: fallback ? '近期都吃过了，已放开重复' : '',
  })
}

function shuffle<T>(list: T[]): T[] {
  const result = list.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

/* ===== 本地缓存 ===== */
function sanitizeCustom(list: any[]): Dish[] {
  return list
    .filter(item => item && typeof item.name === 'string' && item.name.trim().length > 0)
    .map(item => {
      const rawMeals: any[] = Array.isArray(item.meals) ? item.meals : []
      const meals = rawMeals.filter((m: string) => ALL_MEALS.indexOf(m as MealId) >= 0) as MealId[]
      return {
        id: typeof item.id === 'string' && item.id ? item.id : newDishId(),
        name: String(item.name).trim().slice(0, 12),
        meals: meals.length > 0 ? meals : ALL_MEALS.slice(),
        category: 'custom',
        custom: true,
      }
    })
}

function sanitizeHistory(list: any[]): HistoryEntry[] {
  return list
    .filter(item => item && typeof item.name === 'string' && typeof item.ts === 'number')
    .slice(0, MAX_HISTORY)
    .map((item, index) => ({
      id: typeof item.id === 'number' ? item.id : index,
      dishId: typeof item.dishId === 'string' ? item.dishId : '',
      name: item.name,
      ts: item.ts,
      timeLabel: timeLabel(item.ts),
    }))
}

function readStore(): StoredData {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'object') {
      const removedPresetIds = Array.isArray(raw.removedPresetIds)
        ? raw.removedPresetIds.filter((id: any) => typeof id === 'string')
        : []
      return {
        customDishes: sanitizeCustom(Array.isArray(raw.customDishes) ? raw.customDishes : []),
        removedPresetIds,
        history: sanitizeHistory(Array.isArray(raw.history) ? raw.history : []),
        noRepeat: raw.noRepeat !== false,
        shakeEnabled: raw.shakeEnabled !== false,
      }
    }
  } catch (err) {
    console.warn('读取吃点啥缓存失败', err)
  }
  return {
    customDishes: [],
    removedPresetIds: [],
    history: [],
    noRepeat: true,
    shakeEnabled: true,
  }
}

function persist(inst: any) {
  const { customDishes, removedPresetIds, history, noRepeat, shakeEnabled } = inst.data
  try {
    wx.setStorageSync(STORAGE_KEY, {
      customDishes,
      removedPresetIds,
      history,
      noRepeat,
      shakeEnabled,
    })
  } catch (err) {
    console.warn('保存吃点啥缓存失败', err)
  }
}

/* ===== 摇一摇 ===== */
let shakeHandler: ((res: WechatMiniprogram.OnAccelerometerChangeCallbackResult) => void) | null = null
let lastShakeAt = 0

function startShake(inst: any) {
  if (shakeHandler) return
  const handler = (res: WechatMiniprogram.OnAccelerometerChangeCallbackResult) => {
    const power = Math.abs(res.x) + Math.abs(res.y) + Math.abs(res.z)
    const now = Date.now()
    if (power < 3.2 || now - lastShakeAt < 1200) return
    if (inst.data.rolling || inst.data.pkMode) return
    lastShakeAt = now
    inst.onDraw()
  }
  shakeHandler = handler
  wx.startAccelerometer({
    interval: 'normal',
    fail: () => {
      console.warn('当前设备不支持摇一摇')
    },
  })
  wx.onAccelerometerChange(handler)
}

function stopShake() {
  if (!shakeHandler) return
  wx.offAccelerometerChange(shakeHandler)
  wx.stopAccelerometer({})
  shakeHandler = null
}

/* ===== 滚动动画定时器 ===== */
let rollTimer: ReturnType<typeof setInterval> | null = null

function clearRollTimer() {
  if (rollTimer !== null) {
    clearInterval(rollTimer)
    rollTimer = null
  }
}

function showToast(title: string) {
  wx.showToast({ title, icon: 'none', duration: 1500 })
}

/* ===== 页面 ===== */
Component({
  data: {
    meals: MEALS,
    categories: CATEGORIES,
    allDishes: [] as Dish[],
    removedPresetIds: [] as string[],
    activeMeal: 'lunch' as MealId,
    activeCategory: 'all',
    noRepeat: true,
    shakeEnabled: true,
    poolCount: 0,
    poolHint: '',

    result: null as Dish | null,
    resultMeta: '',
    resultAccepted: false,
    rollName: '',
    rolling: false,

    history: [] as HistoryEntry[],
    historyId: 1,

    pkMode: false,
    pkPool: [] as Dish[],
    pkPair: [] as Dish[],
    pkRound: 0,
    pkTotal: 0,

    manageOpen: false,
    newDishName: '',
    newDishMeals: { breakfast: true, lunch: true, dinner: true, lateNight: true },
    customDishes: [] as Dish[],
    totalCount: 0,
  },

  lifetimes: {
    attached() {
      const store = readStore()
      const allDishes = buildAllDishes(store.customDishes, store.removedPresetIds)
      const maxHistoryId = store.history.reduce((max, item) => Math.max(max, item.id), 0)
      this.setData({
        customDishes: store.customDishes,
        removedPresetIds: store.removedPresetIds,
        history: store.history,
        historyId: maxHistoryId + 1,
        allDishes,
        noRepeat: store.noRepeat,
        shakeEnabled: store.shakeEnabled,
        activeMeal: currentMeal(),
        totalCount: allDishes.length,
      })
      refreshPool(this)
    },
    detached() {
      stopShake()
      clearRollTimer()
    },
  },

  pageLifetimes: {
    show() {
      if (this.data.shakeEnabled) startShake(this)
    },
    hide() {
      stopShake()
      clearRollTimer()
      if (this.data.rolling) this.setData({ rolling: false })
    },
  },

  methods: {
    /* ========== 筛选 ========== */
    onMealChange(e: WechatMiniprogram.TouchEvent) {
      if (this.data.rolling) return
      const meal = (e.currentTarget.dataset as { id: MealId }).id
      if (meal === this.data.activeMeal) return
      this.setData({
        activeMeal: meal,
        result: null,
        resultMeta: '',
        resultAccepted: false,
      })
      refreshPool(this)
    },

    onCategoryChange(e: WechatMiniprogram.TouchEvent) {
      if (this.data.rolling) return
      const category = (e.currentTarget.dataset as { id: string }).id
      if (category === this.data.activeCategory) return
      this.setData({
        activeCategory: category,
        result: null,
        resultMeta: '',
        resultAccepted: false,
      })
      refreshPool(this)
    },

    onToggleRepeat() {
      if (this.data.rolling) return
      this.setData({ noRepeat: !this.data.noRepeat })
      refreshPool(this)
      persist(this)
    },

    onToggleShake() {
      const next = !this.data.shakeEnabled
      this.setData({ shakeEnabled: next })
      persist(this)
      if (next) startShake(this)
      else stopShake()
    },

    /* ========== 抽签 ========== */
    onDraw() {
      if (this.data.rolling) return

      const { pool } = buildPool(this.data)
      if (pool.length === 0) {
        showToast('这个组合没菜了，换个条件试试')
        return
      }

      // 尽量避开当前结果，避免连点「换一个」时原地不动
      const current = this.data.result
      let candidates = pool
      if (current && pool.length > 1) {
        const others = pool.filter(d => d.id !== current.id)
        if (others.length > 0) candidates = others
      }
      const finalDish = candidates[Math.floor(Math.random() * candidates.length)]
      const firstPreview = pool[Math.floor(Math.random() * pool.length)]

      clearRollTimer()
      this.setData({
        rolling: true,
        pkMode: false,
        resultAccepted: false,
        rollName: firstPreview.name,
      })

      let step = 0
      rollTimer = setInterval(() => {
        step += 1
        if (step >= ROLL_STEPS) {
          clearRollTimer()
          this.setData({
            rolling: false,
            rollName: '',
            result: finalDish,
            resultMeta: dishMeta(finalDish),
            resultAccepted: false,
          })
          wx.vibrateShort({ type: 'medium' })
          return
        }
        const preview = pool[Math.floor(Math.random() * pool.length)]
        this.setData({ rollName: preview.name })
      }, ROLL_INTERVAL)
    },

    onAccept() {
      if (this.data.rolling) return
      const { result, resultAccepted, history, historyId } = this.data
      if (!result || resultAccepted) return

      const now = Date.now()
      const entry: HistoryEntry = {
        id: historyId,
        dishId: result.id,
        name: result.name,
        ts: now,
        timeLabel: timeLabel(now),
      }
      const nextHistory = [entry].concat(history).slice(0, MAX_HISTORY)
      this.setData({
        history: nextHistory,
        historyId: historyId + 1,
        resultAccepted: true,
      })
      persist(this)
      refreshPool(this)
      wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: '已记下', icon: 'success', duration: 1000 })
    },

    /* ========== 二选一淘汰赛 ========== */
    onStartPk() {
      if (this.data.rolling) return
      const { pool } = buildPool(this.data)
      if (pool.length < 2) {
        showToast('至少要有两道可选菜')
        return
      }
      const picked = shuffle(pool).slice(0, Math.min(PK_LIMIT, pool.length))
      this.setData({
        pkMode: true,
        pkPool: picked,
        pkPair: [picked[0], picked[1]],
        pkRound: 1,
        pkTotal: picked.length - 1,
        result: null,
        resultMeta: '',
        resultAccepted: false,
      })
      wx.vibrateShort({ type: 'light' })
    },

    onPkChoose(e: WechatMiniprogram.TouchEvent) {
      const index = Number((e.currentTarget.dataset as { index: number | string }).index)
      const pair = this.data.pkPair
      if (!pair[index] || this.data.rolling) return

      const winner = pair[index]
      const rest = this.data.pkPool.slice(2)

      if (rest.length === 0) {
        this.setData({
          pkMode: false,
          pkPool: [],
          pkPair: [],
          result: winner,
          resultMeta: dishMeta(winner),
          resultAccepted: false,
        })
        wx.vibrateShort({ type: 'medium' })
        return
      }

      this.setData({
        pkPool: [winner].concat(rest),
        pkPair: [winner, rest[0]],
        pkRound: this.data.pkRound + 1,
      })
      wx.vibrateShort({ type: 'light' })
    },

    onExitPk() {
      this.setData({ pkMode: false, pkPool: [], pkPair: [], pkRound: 0, pkTotal: 0 })
    },

    /* ========== 我的菜单 ========== */
    onToggleManage() {
      this.setData({ manageOpen: !this.data.manageOpen })
    },

    onDishNameInput(e: WechatMiniprogram.Input) {
      this.setData({ newDishName: e.detail.value })
    },

    onToggleDishMeal(e: WechatMiniprogram.TouchEvent) {
      const meal = (e.currentTarget.dataset as { id: MealId }).id
      const map = Object.assign({}, this.data.newDishMeals) as Record<MealId, boolean>
      map[meal] = !map[meal]
      this.setData({ newDishMeals: map })
    },

    onAddDish() {
      const name = this.data.newDishName.trim()
      if (!name) {
        showToast('先输入菜名')
        return
      }
      if (name.length > 12) {
        showToast('菜名最多 12 个字')
        return
      }
      if (this.data.allDishes.some(d => d.name === name)) {
        showToast('菜单里已经有这道菜了')
        return
      }

      const meals = ALL_MEALS.filter(meal => this.data.newDishMeals[meal])
      if (meals.length === 0) {
        showToast('至少选一个餐次')
        return
      }

      const dish: Dish = {
        id: newDishId(),
        name,
        meals,
        category: 'custom',
        custom: true,
      }
      const customDishes = this.data.customDishes.concat(dish)
      const allDishes = buildAllDishes(customDishes, this.data.removedPresetIds)

      this.setData({
        customDishes,
        allDishes,
        newDishName: '',
        totalCount: allDishes.length,
      })
      persist(this)
      refreshPool(this)
      wx.showToast({ title: '已加入菜单', icon: 'success', duration: 1000 })
    },

    onDeleteDish(e: WechatMiniprogram.TouchEvent) {
      if (this.data.rolling) return
      const id = String((e.currentTarget.dataset as { id: string }).id)
      const dish = this.data.allDishes.filter(d => d.id === id)[0]
      if (!dish) return

      wx.showModal({
        title: '删除菜品',
        content: `确定从菜单中删除「${dish.name}」吗？`,
        confirmColor: '#F76707',
        success: (res) => {
          if (!res.confirm) return

          const customDishes = dish.custom
            ? this.data.customDishes.filter(d => d.id !== id)
            : this.data.customDishes
          const removedPresetIds = dish.custom
            ? this.data.removedPresetIds
            : this.data.removedPresetIds.concat(id)
          const allDishes = buildAllDishes(customDishes, removedPresetIds)
          const current = this.data.result
          const clearResult = !!current && current.id === id

          this.setData({
            customDishes,
            removedPresetIds,
            allDishes,
            totalCount: allDishes.length,
            result: clearResult ? null : current,
            resultMeta: clearResult ? '' : this.data.resultMeta,
            resultAccepted: clearResult ? false : this.data.resultAccepted,
          })
          persist(this)
          refreshPool(this)
        },
      })
    },

    onRestorePresets() {
      if (this.data.removedPresetIds.length === 0) return
      const allDishes = buildAllDishes(this.data.customDishes, [])
      this.setData({
        removedPresetIds: [],
        allDishes,
        totalCount: allDishes.length,
      })
      persist(this)
      refreshPool(this)
      wx.showToast({ title: '已恢复内置菜品', icon: 'none', duration: 1200 })
    },

    /* ========== 历史记录 ========== */
    onClearHistory() {
      if (this.data.history.length === 0) return
      wx.showModal({
        title: '清空记录',
        content: '确定清空最近吃过的记录吗？「最近不重复」也会一并重置。',
        confirmColor: '#F76707',
        success: (res) => {
          if (!res.confirm) return
          this.setData({ history: [] })
          persist(this)
          refreshPool(this)
        },
      })
    },

    /* ========== 分享 ========== */
    onShareAppMessage() {
      const { result } = this.data
      return {
        title: result ? `今天就吃「${result.name}」` : '吃什么？让「吃点啥」帮你决定',
        path: '/pages/what-to-eat/what-to-eat',
      }
    },
  },
})
