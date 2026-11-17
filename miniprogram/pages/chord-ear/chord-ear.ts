interface ChordOption {
  name: string
  id: string
  offsets: number[]
}

interface Level {
  label: string
  options: ChordOption[]
}

const BASIC: ChordOption[] = [
  { name: '大三和弦', id: 'maj', offsets: [0, 4, 7] },
  { name: '小三和弦', id: 'min', offsets: [0, 3, 7] },
  { name: '减三和弦', id: 'dim', offsets: [0, 3, 6] },
  { name: '增三和弦', id: 'aug', offsets: [0, 4, 8] },
]

const ADVANCED: ChordOption[] = [
  { name: '大三和弦', id: 'maj', offsets: [0, 4, 7] },
  { name: '小三和弦', id: 'min', offsets: [0, 3, 7] },
  { name: '减三和弦', id: 'dim', offsets: [0, 3, 6] },
  { name: '增三和弦', id: 'aug', offsets: [0, 4, 8] },
  { name: '大七和弦', id: 'maj7', offsets: [0, 4, 7, 11] },
  { name: '属七和弦', id: 'dom7', offsets: [0, 4, 7, 10] },
  { name: '小七和弦', id: 'min7', offsets: [0, 3, 7, 10] },
  { name: '半减七和弦', id: 'm7b5', offsets: [0, 3, 6, 10] },
]

const LEVELS: Level[] = [
  { label: '三和弦', options: BASIC },
  { label: '七和弦', options: ADVANCED },
]

const MIN_ROOT = 48
const MAX_TOP = 79

let audioCtx: any = null
let current: ChordOption | null = null

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
  const root = inst.data.root
  const offsets = current.offsets
  const t = audioCtx.currentTime + 0.08
  const peak = offsets.length >= 4 ? 0.16 : 0.2

  if (inst.data.mode === 'arp') {
    for (let i = 0; i < offsets.length; i++) {
      playTone(root + offsets[i], t + i * 0.18, 0.9, peak)
    }
    return
  }
  for (let i = 0; i < offsets.length; i++) {
    playTone(root + offsets[i], t, 1.8, peak)
  }
}

function makeQuestion(inst: any, silent?: boolean) {
  const options: ChordOption[] = inst.data.options
  const pick = options[Math.floor(Math.random() * options.length)]
  const topLimit = MAX_TOP - pick.offsets[pick.offsets.length - 1]
  const span = Math.max(1, topLimit - MIN_ROOT + 1)
  const root = MIN_ROOT + Math.floor(Math.random() * span)

  current = pick
  inst.setData({
    root,
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
  const options: ChordOption[] = inst.data.options
  const picked = options[index]
  if (!picked) return
  const ok = picked.id === current.id
  let correctIndex = -1
  for (let i = 0; i < options.length; i++) {
    if (options[i].id === current.id) {
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
    mode: 'block',
    root: 60,
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
      if (mode !== 'block' && mode !== 'arp') return
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