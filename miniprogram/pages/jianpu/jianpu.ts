interface KeyOption {
  label: string
  pc: number
  letter: number
  flat: boolean
}

interface ParsedNote {
  key: string
  name: string
}

interface Row {
  num: string
  note: string
  movable: string
  fixed: string
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]
const SCALE_STEP = [0, 2, 4, 5, 7, 9, 11]
const MOVABLE = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']

const KEYS: KeyOption[] = [
  { label: '1=C', pc: 0, letter: 0, flat: false },
  { label: '1=G', pc: 7, letter: 4, flat: false },
  { label: '1=D', pc: 2, letter: 1, flat: false },
  { label: '1=A', pc: 9, letter: 5, flat: false },
  { label: '1=E', pc: 4, letter: 2, flat: false },
  { label: '1=B', pc: 11, letter: 6, flat: false },
  { label: '1=F', pc: 5, letter: 3, flat: true },
  { label: '1=B♭', pc: 10, letter: 6, flat: true },
  { label: '1=E♭', pc: 3, letter: 2, flat: true },
  { label: '1=A♭', pc: 8, letter: 5, flat: true },
  { label: '1=D♭', pc: 1, letter: 1, flat: true },
  { label: '1=G♭', pc: 6, letter: 4, flat: true },
]

/* 依据字母级数书写音名，保证升降号正确 */
function spell(letter: number, pc: number): string {
  let diff = (pc - NATURAL_PC[letter]) % 12
  if (diff > 6) diff -= 12
  if (diff === 0) return LETTERS[letter]
  if (diff > 0) return LETTERS[letter] + '♯'.repeat(diff)
  return LETTERS[letter] + '♭'.repeat(-diff)
}

/* 固定唱名：以 C 为 do */
function fixedSolfege(note: string): string {
  const base = note.charAt(0)
  const rest = note.slice(1)
  const idx = LETTERS.indexOf(base)
  const name = MOVABLE[idx]
  if (!rest) return name
  if (rest.indexOf('♯') >= 0) return '升' + name
  return '降' + name
}

function degreeNote(keyOpt: KeyOption, degree: number): string {
  const letter = (keyOpt.letter + degree - 1) % 7
  const pc = (keyOpt.pc + SCALE_STEP[degree - 1]) % 12
  return spell(letter, pc)
}

function buildRows(keyOpt: KeyOption): Row[] {
  const rows: Row[] = []
  for (let d = 1; d <= 7; d++) {
    const note = degreeNote(keyOpt, d)
    rows.push({
      num: String(d),
      note,
      movable: MOVABLE[d - 1],
      fixed: fixedSolfege(note),
    })
  }
  return rows
}

/* 解析输入的简谱数字串：1–7 为音，0 为休止，其它字符忽略 */
function parseInput(text: string, keyOpt: KeyOption): ParsedNote[] {
  const out: ParsedNote[] = []
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i)
    if (ch >= '1' && ch <= '7') {
      out.push({ key: 'p' + i, name: degreeNote(keyOpt, Number(ch)) })
    } else if (ch === '0') {
      out.push({ key: 'p' + i, name: '休止' })
    }
  }
  return out
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

const INIT_TEXT = '1234567'

Component({
  data: {
    scrollHeight: 0,
    keys: KEYS,
    keyIndex: 0,
    rows: buildRows(KEYS[0]),
    inputText: INIT_TEXT,
    parsed: parseInput(INIT_TEXT, KEYS[0]),
    parsedCount: parseInput(INIT_TEXT, KEYS[0]).length,
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
      const parsed = parseInput(this.data.inputText, keyOpt)
      this.setData({
        keyIndex,
        rows: buildRows(keyOpt),
        parsed,
        parsedCount: parsed.length,
      })
    },

    onInput(e: WechatMiniprogram.Input) {
      const inputText = e.detail.value
      const keyOpt = KEYS[this.data.keyIndex]
      const parsed = parseInput(inputText, keyOpt)
      this.setData({ inputText, parsed, parsedCount: parsed.length })
    },

    onClear() {
      this.setData({ inputText: '', parsed: [], parsedCount: 0 })
    },
  },
})