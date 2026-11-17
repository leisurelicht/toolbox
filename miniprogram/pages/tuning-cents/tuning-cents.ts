interface DegreeRow {
  name: string
  et: string
  just: string
  justRatio: string
  justDev: string
  justDevClass: string
  pyth: string
  pythRatio: string
  pythDev: string
  pythDevClass: string
}

interface CentsResult {
  valid: boolean
  cents: string
  centsClass: string
  semitones: string
  nearest: string
}

/* 以 C 为 0 音分的七声音级（十二平均律 / 纯律 / 五度相生律） */
const RAW_DEGREES = [
  { name: 'C', et: 0, just: 0, justRatio: '1/1', pyth: 0, pythRatio: '1/1' },
  { name: 'D', et: 200, just: 203.91, justRatio: '9/8', pyth: 203.91, pythRatio: '9/8' },
  { name: 'E', et: 400, just: 386.31, justRatio: '5/4', pyth: 407.82, pythRatio: '81/64' },
  { name: 'F', et: 500, just: 498.04, justRatio: '4/3', pyth: 498.04, pythRatio: '4/3' },
  { name: 'G', et: 700, just: 701.96, justRatio: '3/2', pyth: 701.96, pythRatio: '3/2' },
  { name: 'A', et: 900, just: 884.36, justRatio: '5/3', pyth: 905.87, pythRatio: '27/16' },
  { name: 'B', et: 1100, just: 1088.27, justRatio: '15/8', pyth: 1109.78, pythRatio: '243/128' },
]

function fixed2(n: number): string {
  return n.toFixed(2)
}

function signed(n: number): string {
  const v = Math.round(n * 100) / 100
  if (v > 0) return '+' + v.toFixed(2)
  if (v < 0) return v.toFixed(2)
  return '0.00'
}

function devClass(n: number): string {
  if (n > 0.005) return 'up'
  if (n < -0.005) return 'down'
  return 'zero'
}

const DEGREES: DegreeRow[] = RAW_DEGREES.map((d) => {
  const jd = d.just - d.et
  const pd = d.pyth - d.et
  return {
    name: d.name,
    et: fixed2(d.et),
    just: fixed2(d.just),
    justRatio: d.justRatio,
    justDev: signed(jd),
    justDevClass: devClass(jd),
    pyth: fixed2(d.pyth),
    pythRatio: d.pythRatio,
    pythDev: signed(pd),
    pythDevClass: devClass(pd),
  }
})

const SEMITONE_NAMES = [
  '同音',
  '小二度',
  '大二度',
  '小三度',
  '大三度',
  '纯四度',
  '三全音',
  '纯五度',
  '小六度',
  '大六度',
  '小七度',
  '大七度',
  '纯八度',
]

const INVALID_RESULT: CentsResult = {
  valid: false,
  cents: '—',
  centsClass: 'zero',
  semitones: '—',
  nearest: '—',
}

function calcCents(f1: number, f2: number): CentsResult {
  if (!(f1 > 0) || !(f2 > 0)) return INVALID_RESULT

  const cents = 1200 * Math.log2(f2 / f1)
  if (!isFinite(cents)) return INVALID_RESULT

  const semitones = cents / 100
  const nearestIdx = Math.round(Math.abs(semitones))
  const nearest = SEMITONE_NAMES[nearestIdx] || '超出八度'

  /* 音分数保留两位，超过 ±9999 用整数显示 */
  const absCents = Math.abs(cents)
  const centsText = absCents >= 10000 ? String(Math.round(cents)) : (Math.round(cents * 100) / 100).toFixed(2)

  return {
    valid: true,
    cents: centsText,
    centsClass: cents > 0.005 ? 'up' : cents < -0.005 ? 'down' : 'zero',
    semitones: (Math.round(semitones * 100) / 100).toFixed(2),
    nearest,
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
      /* 兜底估算：导航栏 44px + 状态栏 */
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
    degrees: DEGREES,
    freq1: '440',
    freq2: '442',
    result: calcCents(440, 442),
  },

  methods: {
    onFreqInput(e: WechatMiniprogram.Input) {
      const which = e.currentTarget.dataset.which as string
      const value = e.detail.value

      const freq1 = which === '1' ? value : this.data.freq1
      const freq2 = which === '2' ? value : this.data.freq2

      const n1 = parseFloat(freq1)
      const n2 = parseFloat(freq2)
      const result = calcCents(isNaN(n1) ? 0 : n1, isNaN(n2) ? 0 : n2)

      if (which === '1') {
        this.setData({ freq1: value, result })
      } else {
        this.setData({ freq2: value, result })
      }
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
