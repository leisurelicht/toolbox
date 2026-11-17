interface KeyOption {
  label: string
  pc: number
  flat: boolean
}

interface ProgressionDef {
  id: string
  name: string
  degrees: number[]
  desc: string
}

interface ChordChip {
  key: string
  name: string
}

interface ProgressionView {
  id: string
  name: string
  roman: string
  chords: ChordChip[]
  desc: string
}

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

const KEYS: KeyOption[] = [
  { label: 'C', pc: 0, flat: false },
  { label: 'G', pc: 7, flat: false },
  { label: 'D', pc: 2, flat: false },
  { label: 'A', pc: 9, flat: false },
  { label: 'E', pc: 4, flat: false },
  { label: 'B', pc: 11, flat: false },
  { label: 'F♯', pc: 6, flat: false },
  { label: 'F', pc: 5, flat: true },
  { label: 'B♭', pc: 10, flat: true },
  { label: 'E♭', pc: 3, flat: true },
  { label: 'A♭', pc: 8, flat: true },
  { label: 'D♭', pc: 1, flat: true },
]

/* 大调音阶各级的半音偏移与和弦性质 */
const DEGREE_SEMI = [0, 2, 4, 5, 7, 9, 11]
const TRIAD_SUFFIX = ['', 'm', 'm', '', '', 'm', 'dim']
const SEVENTH_SUFFIX = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7♭5']
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

const DEFS: ProgressionDef[] = [
  { id: 'p1', name: 'ii–V–I 终止式', degrees: [2, 5, 1], desc: '最常见的和声终止，古典与爵士的核心进行' },
  { id: 'p2', name: 'I–IV–V–I', degrees: [1, 4, 5, 1], desc: '正三和弦终止，古典时期最常见的收束' },
  { id: 'p3', name: 'I–vi–IV–V', degrees: [1, 6, 4, 5], desc: '「50 年代进行」，流行与摇滚中极常见' },
  { id: 'p4', name: 'I–V–vi–IV', degrees: [1, 5, 6, 4], desc: '「流行四大和弦」，大量当代歌曲使用' },
  { id: 'p5', name: 'vi–IV–I–V', degrees: [6, 4, 1, 5], desc: '与上一进行同环异位，小调色彩更强' },
  { id: 'p6', name: 'I–iii–IV–V', degrees: [1, 3, 4, 5], desc: '级进上行，抒情段落常用' },
  { id: 'p7', name: '卡农进行', degrees: [1, 5, 6, 3, 4, 1, 4, 5], desc: '帕赫贝尔《卡农》式的八和弦循环' },
  { id: 'p8', name: '五度循环', degrees: [6, 2, 5, 1], desc: '按五度下行推进，爵士与浪漫派常用来转调' },
  { id: 'p9', name: 'IV–V–I', degrees: [4, 5, 1], desc: '下属—属—主的完整功能终止' },
  { id: 'p10', name: '12 小节布鲁斯', degrees: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5], desc: '布鲁斯与爵士的基础曲式，属七和弦最常用' },
]

function chordNameOf(keyOpt: KeyOption, degree: number, seventh: boolean): string {
  const names = keyOpt.flat ? FLAT_NAMES : SHARP_NAMES
  const rootPc = (keyOpt.pc + DEGREE_SEMI[degree - 1]) % 12
  const suffix = seventh ? SEVENTH_SUFFIX[degree - 1] : TRIAD_SUFFIX[degree - 1]
  return names[rootPc] + suffix
}

function buildViews(keyOpt: KeyOption, seventh: boolean): ProgressionView[] {
  return DEFS.map((d) => {
    const chords: ChordChip[] = []
    const romans: string[] = []
    for (let i = 0; i < d.degrees.length; i++) {
      const deg = d.degrees[i]
      chords.push({ key: d.id + '-c' + i, name: chordNameOf(keyOpt, deg, seventh) })
      romans.push(ROMAN[deg - 1])
    }
    return {
      id: d.id,
      name: d.name,
      roman: romans.join('–'),
      chords,
      desc: d.desc,
    }
  })
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
    keys: KEYS,
    keyIndex: 0,
    seventh: false,
    views: buildViews(KEYS[0], false),
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onKey(e: WechatMiniprogram.TouchEvent) {
      const keyIndex = Number(e.currentTarget.dataset.index)
      const keyOpt = KEYS[keyIndex]
      if (!keyOpt) return
      this.setData({
        keyIndex,
        views: buildViews(keyOpt, this.data.seventh),
      })
    },

    onQuality(e: WechatMiniprogram.TouchEvent) {
      const seventh = e.currentTarget.dataset.seventh === 'true'
      if (seventh === this.data.seventh) return
      const keyOpt = KEYS[this.data.keyIndex]
      this.setData({ seventh, views: buildViews(keyOpt, seventh) })
    },
  },
})