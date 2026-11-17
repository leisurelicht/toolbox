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

/* ===== 模块级状态（页面单实例，避免 this 类型推断问题） ===== */
let timer: any = null
let nextAt = 0
let beatCursor = 0
let running = false
let instance: any = null
let webAudio: any = null
let normCtx: any = null
let accCtx: any = null
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
    return
  } catch (e) {
    normCtx = null
    accCtx = null
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

function playClick(accent: boolean) {
  const ctx = accent ? accCtx : normCtx
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
    osc.frequency.value = accent ? 1500 : 950
    gain.gain.setValueAtTime(accent ? 0.32 : 0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    osc.connect(gain)
    gain.connect(webAudio.destination)
    osc.start(t)
    osc.stop(t + 0.08)
  } catch (e) {
    /* 忽略播放异常 */
  }
}

function fireBeat() {
  if (!instance) return
  const beats = instance.data.beats
  instance.setData({
    beatIndex: beatCursor,
    beatText: beatCursor + 1 + ' / ' + beats,
  })
  playClick(beatCursor === 0)
  beatCursor = (beatCursor + 1) % beats
}

function schedule() {
  if (!running || !instance) return
  const interval = 60000 / instance.data.bpm
  const delay = Math.max(0, nextAt - Date.now())
  timer = setTimeout(() => {
    if (!running) return
    fireBeat()
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
  beatCursor = 0
  nextAt = Date.now()
  instance.setData({ running: true })
  fireBeat()
  nextAt = Date.now() + 60000 / instance.data.bpm
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
    nextAt = Date.now() + 60000 / safe
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
    presets: PRESETS,
    barOptions: BAR_OPTIONS,
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
      beatCursor = 0
      this.setData({ beats, dots: buildDots(beats), beatIndex: -1, beatText: '—' })
    },

    onTap() {
      registerTap()
    },
  },
})