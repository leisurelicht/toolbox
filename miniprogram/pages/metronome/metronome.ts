interface BarOption {
  label: string
  beats: number
}

const MIN_BPM = 30
const MAX_BPM = 240

const PRESETS = [60, 72, 84, 96, 120, 144, 168]

const BAR_OPTIONS: BarOption[] = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 6 },
]

interface DivisionOption {
  value: number
  label: string
}

const DIVISIONS: DivisionOption[] = [
  { value: 1, label: '不细分' },
  { value: 2, label: '八分' },
  { value: 3, label: '三连音' },
  { value: 4, label: '十六分' },
]

/* ===== 模块级状态（页面单实例，避免 this 类型推断问题） ===== */
let timer: any = null
let nextAt = 0
let tickCursor = 0
let running = false
let instance: any = null
let webAudio: any = null
let normCtx: any = null
let accCtx: any = null
let softCtx: any = null
let tapTimes: number[] = []

function clampBpm(v: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(v)))
}

function buildDots(beats: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < beats; i++) {
    arr.push(i)
  }
  return arr
}

/* 优先用本地 wav（InnerAudioContext 在开发者工具与真机都稳定），失败再用 WebAudio 合成 */
function initAudio() {
  if (normCtx || webAudio) return
  try {
    normCtx = wx.createInnerAudioContext()
    normCtx.src = '/assets/click.wav'
    normCtx.obeyMuteSwitch = false
    accCtx = wx.createInnerAudioContext()
    accCtx.src = '/assets/click-accent.wav'
    accCtx.obeyMuteSwitch = false
    softCtx = wx.createInnerAudioContext()
    softCtx.src = '/assets/click-soft.wav'
    softCtx.obeyMuteSwitch = false
    return
  } catch (e) {
    normCtx = null
    accCtx = null
    softCtx = null
  }
  try {
    const w = wx as any
    if (typeof w.createWebAudioContext === 'function') {
      const ctx = w.createWebAudioContext()
      if (ctx && ctx.destination) {
        webAudio = ctx
      }
    }
  } catch (e) {
    webAudio = null
  }
}

function playClick(kind: string) {
  let ctx = normCtx
  if (kind === 'accent') ctx = accCtx
  if (kind === 'soft') ctx = softCtx
  if (ctx) {
    try {
      ctx.stop()
      ctx.play()
      return
    } catch (e) {
      /* 走 WebAudio 回退 */
    }
  }
  if (!webAudio) return
  try {
    const t = webAudio.currentTime
    const osc = webAudio.createOscillator()
    const gain = webAudio.createGain()
    osc.type = 'square'
    let freq = 950
    let peak = 0.2
    if (kind === 'accent') {
      freq = 1500
      peak = 0.32
    } else if (kind === 'soft') {
      freq = 720
      peak = 0.11
    }
    osc.frequency.value = freq
    gain.gain.setValueAtTime(peak, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    osc.connect(gain)
    gain.connect(webAudio.destination)
    osc.start(t)
    osc.stop(t + 0.07)
  } catch (e) {
    /* 忽略播放异常 */
  }
}

function fireTick() {
  if (!instance) return
  const beats = instance.data.beats
  const division = instance.data.division
  const beatIndex = Math.floor(tickCursor / division) % beats
  const isMain = tickCursor % division === 0

  if (isMain) {
    instance.setData({
      beatIndex,
      beatText: beatIndex + 1 + ' / ' + beats,
    })
    playClick(beatIndex === 0 ? 'accent' : 'normal')
  } else {
    playClick('soft')
  }
  tickCursor += 1
}

function tickInterval(): number {
  if (!instance) return 500
  const division = instance.data.division || 1
  return 60000 / instance.data.bpm / division
}

function schedule() {
  if (!running || !instance) return
  const interval = tickInterval()
  const delay = Math.max(0, nextAt - Date.now())
  timer = setTimeout(() => {
    if (!running) return
    fireTick()
    nextAt += interval
    /* 若因主线程阻塞落后超过一拍，重新对齐，避免连击 */
    if (Date.now() - nextAt > interval) {
      nextAt = Date.now() + interval
    }
    schedule()
  }, delay)
}

function startMetronome() {
  if (!instance || running) return
  running = true
  tickCursor = 0
  nextAt = Date.now()
  instance.setData({ running: true })
  fireTick()
  nextAt = Date.now() + tickInterval()
  schedule()
}

function stopMetronome() {
  running = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (instance) {
    instance.setData({ running: false, beatIndex: -1, beatText: '—' })
  }
}

function setBpm(bpm: number) {
  if (!instance) return
  const safe = clampBpm(bpm)
  instance.setData({ bpm: safe })
  if (running) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    nextAt = Date.now() + 60000 / safe / (instance.data.division || 1)
    schedule()
  }
}

/* 连续点击取平均间隔定速 */
function registerTap() {
  if (!instance) return
  const now = Date.now()
  const last = tapTimes.length > 0 ? tapTimes[tapTimes.length - 1] : 0
  if (last && now - last > 2000) {
    tapTimes = []
  }
  tapTimes.push(now)
  if (tapTimes.length > 6) {
    tapTimes.shift()
  }
  if (tapTimes.length >= 2) {
    const span = tapTimes[tapTimes.length - 1] - tapTimes[0]
    const avg = span / (tapTimes.length - 1)
    if (avg > 0) {
      setBpm(60000 / avg)
    }
  }
}

/* 计算滚动区高度 = 视口高度 - 固定顶栏占用高度（含导航栏） */
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
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 40)
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    scrollHeight: 0,
    bpm: 120,
    beats: 4,
    division: 1,
    presets: PRESETS,
    barOptions: BAR_OPTIONS,
    divisions: DIVISIONS,
    dots: buildDots(4),
    beatIndex: -1,
    beatText: '—',
    running: false,
  },

  lifetimes: {
    ready() {
      instance = this
      initAudio()
      applyScrollHeight(this)
    },
    detached() {
      stopMetronome()
      instance = null
    },
  },

  pageLifetimes: {
    hide() {
      stopMetronome()
    },
  },

  methods: {
    onStartStop() {
      if (running) {
        stopMetronome()
      } else {
        startMetronome()
      }
    },

    onStep(e: WechatMiniprogram.TouchEvent) {
      const delta = Number(e.currentTarget.dataset.delta)
      setBpm(this.data.bpm + delta)
    },

    onPreset(e: WechatMiniprogram.TouchEvent) {
      setBpm(Number(e.currentTarget.dataset.bpm))
    },

    onBeats(e: WechatMiniprogram.TouchEvent) {
      const beats = Number(e.currentTarget.dataset.beats)
      stopMetronome()
      tickCursor = 0
      this.setData({ beats, dots: buildDots(beats), beatIndex: -1, beatText: '—' })
    },

    onDivision(e: WechatMiniprogram.TouchEvent) {
      const division = Number(e.currentTarget.dataset.value)
      if (division === this.data.division) return
      stopMetronome()
      tickCursor = 0
      this.setData({ division, beatIndex: -1, beatText: '—' })
    },

    onTap() {
      registerTap()
    },
  },
})