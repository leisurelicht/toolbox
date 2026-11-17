interface Root {
  pc: number
  letter: number
  label: string
}

interface ScaleDef {
  id: string
  name: string
  en: string
  steps: number[]
  letters: number[]
  structure: string
  desc: string
}

interface ScaleNote {
  name: string
  isRoot: boolean
}

interface ScaleView {
  id: string
  name: string
  en: string
  notes: ScaleNote[]
  structure: string
  desc: string
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]

/* 12 个主音，两种书写方式 */
const SHARP_ROOTS: Root[] = [
  { pc: 0, letter: 0, label: 'C' },
  { pc: 1, letter: 0, label: 'C♯' },
  { pc: 2, letter: 1, label: 'D' },
  { pc: 3, letter: 1, label: 'D♯' },
  { pc: 4, letter: 2, label: 'E' },
  { pc: 5, letter: 3, label: 'F' },
  { pc: 6, letter: 3, label: 'F♯' },
  { pc: 7, letter: 4, label: 'G' },
  { pc: 8, letter: 4, label: 'G♯' },
  { pc: 9, letter: 5, label: 'A' },
  { pc: 10, letter: 5, label: 'A♯' },
  { pc: 11, letter: 6, label: 'B' },
]

const FLAT_ROOTS: Root[] = [
  { pc: 0, letter: 0, label: 'C' },
  { pc: 1, letter: 1, label: 'D♭' },
  { pc: 2, letter: 1, label: 'D' },
  { pc: 3, letter: 2, label: 'E♭' },
  { pc: 4, letter: 2, label: 'E' },
  { pc: 5, letter: 3, label: 'F' },
  { pc: 6, letter: 4, label: 'G♭' },
  { pc: 7, letter: 4, label: 'G' },
  { pc: 8, letter: 5, label: 'A♭' },
  { pc: 9, letter: 5, label: 'A' },
  { pc: 10, letter: 6, label: 'B♭' },
  { pc: 11, letter: 6, label: 'B' },
]

/* letters 为该音在七声音级中的字母偏移，用于正确书写升降号 */
const SCALES: ScaleDef[] = [
  {
    id: 'major',
    name: '大调',
    en: 'Major / Ionian',
    steps: [0, 2, 4, 5, 7, 9, 11],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 全 半 全 全 全 半',
    desc: '自然大调音阶，音程结构与伊奥尼亚调式相同',
  },
  {
    id: 'natural-minor',
    name: '自然小调',
    en: 'Natural Minor / Aeolian',
    steps: [0, 2, 3, 5, 7, 8, 10],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 半 全 全 半 全 全',
    desc: '与大调相比降低第 3、6、7 级，即爱奥利亚调式',
  },
  {
    id: 'harmonic-minor',
    name: '和声小调',
    en: 'Harmonic Minor',
    steps: [0, 2, 3, 5, 7, 8, 11],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 半 全 全 半 增二度 半',
    desc: '自然小调升高第 7 级形成导音，第 6–7 级之间产生增二度',
  },
  {
    id: 'melodic-minor',
    name: '旋律小调',
    en: 'Melodic Minor (asc.)',
    steps: [0, 2, 3, 5, 7, 9, 11],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 半 全 全 全 全 半',
    desc: '上行升高第 6、7 级；下行通常还原，此处仅示上行',
  },
  {
    id: 'dorian',
    name: '多利亚',
    en: 'Dorian',
    steps: [0, 2, 3, 5, 7, 9, 10],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 半 全 全 全 半 全',
    desc: '自然小调升高第 6 级；相当于降低第 3、7 级的大调',
  },
  {
    id: 'phrygian',
    name: '弗里几亚',
    en: 'Phrygian',
    steps: [0, 1, 3, 5, 7, 8, 10],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '半 全 全 全 半 全 全',
    desc: '自然小调降低第 2 级，带有“西班牙”色彩',
  },
  {
    id: 'lydian',
    name: '利底亚',
    en: 'Lydian',
    steps: [0, 2, 4, 6, 7, 9, 11],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 全 全 半 全 全 半',
    desc: '大调升高第 4 级，升四度是它的特征音',
  },
  {
    id: 'mixolydian',
    name: '混合利底亚',
    en: 'Mixolydian',
    steps: [0, 2, 4, 5, 7, 9, 10],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '全 全 半 全 全 半 全',
    desc: '大调降低第 7 级，常见于布鲁斯与民间音乐',
  },
  {
    id: 'locrian',
    name: '洛克里亚',
    en: 'Locrian',
    steps: [0, 1, 3, 5, 6, 8, 10],
    letters: [0, 1, 2, 3, 4, 5, 6],
    structure: '半 全 全 半 全 全 全',
    desc: '大调降低第 2、5 级，主和弦为减三和弦',
  },
  {
    id: 'major-pentatonic',
    name: '大调五声',
    en: 'Major Pentatonic',
    steps: [0, 2, 4, 7, 9],
    letters: [0, 1, 2, 4, 5],
    structure: '全 全 小三度 全 小三度',
    desc: '由大调音阶去掉第 4、7 级而成',
  },
  {
    id: 'minor-pentatonic',
    name: '小调五声',
    en: 'Minor Pentatonic',
    steps: [0, 3, 5, 7, 10],
    letters: [0, 2, 3, 4, 6],
    structure: '小三度 全 全 小三度 全',
    desc: '由自然小调去掉第 2、6 级而成',
  },
]

/* 依据字母级数书写音名，自动产生 ♯ / ♭ / ♯♯ / ♭♭ */
function spellNote(letter: number, pc: number): string {
  let diff = (pc - NATURAL_PC[letter]) % 12
  if (diff > 6) diff -= 12
  if (diff === 0) return LETTERS[letter]
  if (diff > 0) return LETTERS[letter] + '♯'.repeat(diff)
  return LETTERS[letter] + '♭'.repeat(-diff)
}

function buildViews(root: Root): ScaleView[] {
  return SCALES.map((def) => {
    const notes: ScaleNote[] = def.steps.map((step, i) => {
      const letter = (root.letter + def.letters[i]) % 7
      const pc = (root.pc + step) % 12
      return { name: spellNote(letter, pc), isRoot: i === 0 }
    })
    return {
      id: def.id,
      name: def.name,
      en: def.en,
      notes,
      structure: def.structure,
      desc: def.desc,
    }
  })
}

const INIT_ROOT = SHARP_ROOTS[0]

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
    useFlat: false,
    roots: SHARP_ROOTS,
    activeRootIndex: 0,
    currentRootLabel: INIT_ROOT.label,
    scales: buildViews(INIT_ROOT),
  },

  methods: {
    onSpell(e: WechatMiniprogram.TouchEvent) {
      const mode = e.currentTarget.dataset.mode as string
      const useFlat = mode === 'flat'
      if (useFlat === this.data.useFlat) return

      const curPc = this.data.roots[this.data.activeRootIndex].pc
      const roots = useFlat ? FLAT_ROOTS : SHARP_ROOTS
      let idx = 0
      for (let i = 0; i < roots.length; i++) {
        if (roots[i].pc === curPc) {
          idx = i
          break
        }
      }
      this.setData({
        useFlat,
        roots,
        activeRootIndex: idx,
        currentRootLabel: roots[idx].label,
        scales: buildViews(roots[idx]),
      })
    },

    onRoot(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const root = this.data.roots[index]
      if (!root) return
      this.setData({
        activeRootIndex: index,
        currentRootLabel: root.label,
        scales: buildViews(root),
      })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
