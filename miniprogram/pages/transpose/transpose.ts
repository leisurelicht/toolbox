interface Root {
  pc: number
  letter: number
  label: string
}

interface TransposeResult {
  intervalName: string
  semitones: number
  fromLabel: string
  toLabel: string
  fromNotes: string[]
  toNotes: string[]
  direction: string
}

interface TranspInstrument {
  name: string
  sounding: string
  desc: string
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]

/* 常用调名书写（少用重升重降） */
const ROOTS: Root[] = [
  { pc: 0, letter: 0, label: 'C' },
  { pc: 1, letter: 1, label: 'D♭' },
  { pc: 2, letter: 1, label: 'D' },
  { pc: 3, letter: 2, label: 'E♭' },
  { pc: 4, letter: 2, label: 'E' },
  { pc: 5, letter: 3, label: 'F' },
  { pc: 6, letter: 3, label: 'F♯' },
  { pc: 7, letter: 4, label: 'G' },
  { pc: 8, letter: 5, label: 'A♭' },
  { pc: 9, letter: 5, label: 'A' },
  { pc: 10, letter: 6, label: 'B♭' },
  { pc: 11, letter: 6, label: 'B' },
]

const INTERVAL_TABLE: Record<number, Record<number, string>> = {
  1: { 0: '纯一度' },
  2: { 1: '小二度', 2: '大二度', 3: '增二度' },
  3: { 2: '减三度', 3: '小三度', 4: '大三度' },
  4: { 4: '减四度', 5: '纯四度', 6: '增四度' },
  5: { 6: '减五度', 7: '纯五度', 8: '增五度' },
  6: { 7: '减六度', 8: '小六度', 9: '大六度' },
  7: { 9: '减七度', 10: '小七度', 11: '大七度' },
}

const INSTRUMENTS: TranspInstrument[] = [
  { name: 'B♭ 单簧管', sounding: 'B♭', desc: '记谱比实音高大二度' },
  { name: 'A 单簧管', sounding: 'A', desc: '记谱比实音高小三度' },
  { name: 'F 圆号', sounding: 'F', desc: '记谱比实音高纯五度' },
  { name: 'B♭ 小号', sounding: 'B♭', desc: '记谱比实音高大二度' },
  { name: 'E♭ 中音萨克斯', sounding: 'E♭', desc: '记谱比实音高大六度' },
  { name: 'B♭ 次中音萨克斯', sounding: 'B♭', desc: '记谱比实音高大九度' },
  { name: '英国管（F）', sounding: 'F', desc: '记谱比实音高纯五度' },
  { name: 'G 中音长笛', sounding: 'G', desc: '记谱比实音高纯四度' },
]

/* 按字母级数正确书写音名 */
function spellNote(letter: number, pc: number): string {
  let diff = (pc - NATURAL_PC[letter]) % 12
  if (diff > 6) diff -= 12
  if (diff === 0) return LETTERS[letter]
  if (diff > 0) return LETTERS[letter] + '♯'.repeat(diff)
  return LETTERS[letter] + '♭'.repeat(-diff)
}

function scaleOf(root: Root): string[] {
  return MAJOR_STEPS.map((step, i) => {
    const letter = (root.letter + i) % 7
    return spellNote(letter, (root.pc + step) % 12)
  })
}

/* 查表取音程名，避免在 tsconfig strict 下对 `{}` 做索引 */
function intervalNameOf(degree: number, semitones: number): string {
  const row = INTERVAL_TABLE[degree]
  if (!row) return ''
  const name = row[semitones]
  return name ? name : ''
}

function computeTranspose(from: Root, to: Root): TransposeResult {
  const degree = ((to.letter - from.letter + 7) % 7) + 1
  const semitones = (to.pc - from.pc + 12) % 12

  const name = intervalNameOf(degree, semitones) || '变化音程'

  let direction = '同度移调'
  if (semitones > 0) {
    direction = semitones <= 6 ? '上行移调' : '下行移调'
  }

  return {
    intervalName: name,
    semitones,
    fromLabel: from.label,
    toLabel: to.label,
    fromNotes: scaleOf(from),
    toNotes: scaleOf(to),
    direction,
  }
}

const INIT_FROM = 0
const INIT_TO = 7

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
    roots: ROOTS,
    fromIndex: INIT_FROM,
    toIndex: INIT_TO,
    result: computeTranspose(ROOTS[INIT_FROM], ROOTS[INIT_TO]),
    instruments: INSTRUMENTS,
  },

  methods: {
    onFrom(e: WechatMiniprogram.TouchEvent) {
      const fromIndex = Number(e.currentTarget.dataset.index)
      this.setData({
        fromIndex,
        result: computeTranspose(ROOTS[fromIndex], ROOTS[this.data.toIndex]),
      })
    },

    onTo(e: WechatMiniprogram.TouchEvent) {
      const toIndex = Number(e.currentTarget.dataset.index)
      this.setData({
        toIndex,
        result: computeTranspose(ROOTS[this.data.fromIndex], ROOTS[toIndex]),
      })
    },

    onSwap() {
      const { fromIndex, toIndex } = this.data
      this.setData({
        fromIndex: toIndex,
        toIndex: fromIndex,
        result: computeTranspose(ROOTS[toIndex], ROOTS[fromIndex]),
      })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
