interface Analysis {
  valid: boolean
  note: string
  centsText: string
  centsClass: string
  standard: string
  barLeft: number
  hint: string
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

const QUICK = [
  { key: 'q1', label: '440 Hz', value: '440' },
  { key: 'q2', label: '442 Hz', value: '442' },
  { key: 'q3', label: '415 Hz', value: '415' },
  { key: 'q4', label: 'C4 261.63', value: '261.63' },
]

const INVALID: Analysis = {
  valid: false,
  note: '—',
  centsText: '—',
  centsClass: 'zero',
  standard: '—',
  barLeft: 50,
  hint: '请输入大于 0 的频率',
}

function analyze(freq: number): Analysis {
  if (!(freq > 0)) return INVALID
  const midiFloat = 69 + 12 * Math.log2(freq / 440)
  if (!isFinite(midiFloat)) return INVALID

  const midi = Math.round(midiFloat)
  if (midi < 12 || midi > 120) return INVALID

  const cents = (midiFloat - midi) * 100
  const octave = Math.floor(midi / 12) - 1
  const note = NOTE_NAMES[midi % 12] + octave
  const standard = 440 * Math.pow(2, (midi - 69) / 12)

  const centsRounded = Math.round(cents * 100) / 100
  const centsText = centsRounded > 0 ? '+' + centsRounded.toFixed(2) : centsRounded.toFixed(2)
  const centsClass = centsRounded > 0.5 ? 'up' : centsRounded < -0.5 ? 'down' : 'zero'
  const hint = centsRounded > 0.5 ? '偏高' : centsRounded < -0.5 ? '偏低' : '准确'

  return {
    valid: true,
    note,
    centsText,
    centsClass,
    standard: standard.toFixed(2),
    barLeft: 50 + Math.max(-50, Math.min(50, cents)),
    hint,
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

const INIT = '440'

Component({
  data: {
    scrollHeight: 0,
    freqText: INIT,
    quick: QUICK,
    result: analyze(440),
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onInput(e: WechatMiniprogram.Input) {
      const freqText = e.detail.value
      const freq = parseFloat(freqText)
      this.setData({ freqText, result: analyze(isNaN(freq) ? 0 : freq) })
    },

    onQuick(e: WechatMiniprogram.TouchEvent) {
      const value = e.currentTarget.dataset.value as string
      const freq = parseFloat(value)
      this.setData({ freqText: value, result: analyze(isNaN(freq) ? 0 : freq) })
    },
  },
})