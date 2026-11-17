interface Option {
  name: string
  semi: number
}

interface Level {
  label: string
  options: Option[]
}

interface Question {
  root: number
  semi: number
  name: string
}

const BASIC: Option[] = [
  { name: '大二度', semi: 2 },
  { name: '小三度', semi: 3 },
  { name: '大三度', semi: 4 },
  { name: '纯四度', semi: 5 },
  { name: '纯五度', semi: 7 },
  { name: '纯八度', semi: 12 },
]

const ADVANCED: Option[] = [
  { name: '小二度', semi: 1 },
  { name: '大二度', semi: 2 },
  { name: '小三度', semi: 3 },
  { name: '大三度', semi: 4 },
  { name: '纯四度', semi: 5 },
  { name: '三全音', semi: 6 },
  { name: '纯五度', semi: 7 },
  { name: '小六度', semi: 8 },
  { name: '大六度', semi: 9 },
  { name: '小七度', semi: 10 },
  { name: '大七度', semi: 11 },
  { name: '纯八度', semi: 12 },
]

const LEVELS: Level[] = [
  { label: '基础', options: BASIC },
  { label: '进阶', options: ADVANCED },
]

const MIN_ROOT = 52
const MAX_TOP = 84

let audioCtx: any = null
let current: Question | null = null

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function initAudio(): boolean {
  if (audioCtx) return true
  try {
    const w = wx as any
    if (typeof w.createWebAudioContext === 'function') {
      const ctx = w.createWebAudioContext()
      if (ctx && ctx.destination) {
        audioCtx = ctx
        return true
      }
    }
  } catch (e) {
    audioCtx = null
  }
  return false
}

function playTone(midi: number, at: number, dur: number, peak: number) {
  if (!audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(midi)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(at)
    osc.stop(at + dur + 0.05)
  } catch (e) {
    /* 忽略单次播放异常 */
  }
}

function playQuestion(inst: any) {
  if (!current) return
  if (!initAudio()) {
    wx.showToast({ title: '当前环境不支持音频合成', icon: 'none', duration: 1500 })
    return
  }
  const t = audioCtx.currentTime + 0.08
  if (inst.data.mode === 'harmony') {
    playTone(current.root, t, 1.6, 0.2)
    playTone(current.root + current.semi, t, 1.6, 0.2)
    return
  }
  playTone(current.root, t, 0.7, 0.28)
  playTone(current.root + current.semi, t + 0.75, 0.9, 0.28)
}

function makeQuestion(inst: any, silent?: boolean) {
  const options: Option[] = inst.data.options
  const pick = options[Math.floor(Math.random() * options.length)]
  const topLimit = MAX_TOP - pick.semi
  const span = Math.max(1, topLimit - MIN_ROOT + 1)
  const root = MIN_ROOT + Math.floor(Math.random() * span)
  current = { root, semi: pick.semi, name: pick.name }
  inst.setData({
    answered: false,
    chosenIndex: -1,
    correctIndex: -1,
    resultOk: false,
    resultText: '',
    questionNo: inst.data.questionNo + 1,
  })
  if (!silent) {
    playQuestion(inst)
  }
}

function judge(inst: any, index: number) {
  if (inst.data.answered || !current) return
  const options: Option[] = inst.data.options
  const picked = options[index]
  if (!picked) return
  const ok = picked.semi === current.semi
  let correctIndex = -1
  for (let i = 0; i < options.length; i++) {
    if (options[i].semi === current.semi) {
      correctIndex = i
      break
    }
  }
  inst.setData({
    answered: true,
    chosenIndex: index,
    correctIndex,
    resultOk: ok,
    resultText: ok ? '正确！' : '正确答案是「' + current.name + '」',
    total: inst.data.total + 1,
    right: inst.data.right + (ok ? 1 : 0),
    streak: ok ? inst.data.streak + 1 : 0,
  })
  wx.vibrateShort({ type: ok ? 'light' : 'medium' })
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
    levels: LEVELS,
    levelIndex: 0,
    options: LEVELS[0].options,
    mode: 'melody',
    questionNo: 0,
    answered: false,
    chosenIndex: -1,
    correctIndex: -1,
    resultOk: false,
    resultText: '',
    total: 0,
    right: 0,
    streak: 0,
  },

  lifetimes: {
    ready() {
      initAudio()
      applyScrollHeight(this)
      makeQuestion(this, true)
    },
  },

  methods: {
    onLevel(e: WechatMiniprogram.TouchEvent) {
      const levelIndex = Number(e.currentTarget.dataset.index)
      if (levelIndex === this.data.levelIndex) return
      this.setData({ levelIndex, options: LEVELS[levelIndex].options })
      makeQuestion(this)
    },

    onMode(e: WechatMiniprogram.TouchEvent) {
      const mode = e.currentTarget.dataset.mode as string
      if (mode !== 'melody' && mode !== 'harmony') return
      this.setData({ mode })
      playQuestion(this)
    },

    onPlay() {
      playQuestion(this)
    },

    onOption(e: WechatMiniprogram.TouchEvent) {
      judge(this, Number(e.currentTarget.dataset.index))
    },

    onNext() {
      makeQuestion(this)
    },

    onReset() {
      this.setData({ total: 0, right: 0, streak: 0 })
      makeQuestion(this)
    },
  },
})