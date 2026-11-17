interface NoteSel {
  letter: number
  acc: number
}

interface IntervalResult {
  name: string
  note1: string
  note2: string
  semitones: number
  wholeToneText: string
  consonance: string
  inversion: string
  tip: string
}

interface RefItem {
  semi: number
  name: string
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]
/* acc = -1 / 0 / 1，索引时 +1 */
const ACC_LABEL = ['♭', '', '♯']

const ACC_OPTIONS = [
  { value: -1, label: '♭' },
  { value: 0, label: '♮' },
  { value: 1, label: '♯' },
]

/* 度数 → 半音数 → 音程名称 */
const INTERVAL_TABLE: Record<number, Record<number, string>> = {
  1: { 0: '纯一度', 1: '增一度', 2: '倍增一度' },
  2: { 0: '减二度', 1: '小二度', 2: '大二度', 3: '增二度', 4: '倍增二度' },
  3: { 1: '倍减三度', 2: '减三度', 3: '小三度', 4: '大三度', 5: '增三度' },
  4: { 3: '倍减四度', 4: '减四度', 5: '纯四度', 6: '增四度', 7: '倍增四度' },
  5: { 5: '倍减五度', 6: '减五度', 7: '纯五度', 8: '增五度', 9: '倍增五度' },
  6: { 6: '倍减六度', 7: '减六度', 8: '小六度', 9: '大六度', 10: '增六度' },
  7: { 8: '倍减七度', 9: '减七度', 10: '小七度', 11: '大七度', 12: '增七度' },
  8: { 11: '减八度', 12: '纯八度', 13: '增八度' },
}

const PERFECT_SET = ['纯一度', '纯四度', '纯五度', '纯八度']
const IMPERFECT_SET = ['小三度', '大三度', '小六度', '大六度']

const REF_LIST: RefItem[] = [
  { semi: 0, name: '纯一度' },
  { semi: 1, name: '小二度' },
  { semi: 2, name: '大二度' },
  { semi: 3, name: '小三度' },
  { semi: 4, name: '大三度' },
  { semi: 5, name: '纯四度' },
  { semi: 6, name: '增四度 / 减五度（三全音）' },
  { semi: 7, name: '纯五度' },
  { semi: 8, name: '小六度' },
  { semi: 9, name: '大六度' },
  { semi: 10, name: '小七度' },
  { semi: 11, name: '大七度' },
  { semi: 12, name: '纯八度' },
]

function noteName(sel: NoteSel): string {
  return LETTERS[sel.letter] + ACC_LABEL[sel.acc + 1]
}

function pitchClass(sel: NoteSel): number {
  return (NATURAL_PC[sel.letter] + sel.acc + 12) % 12
}

/* 半音数 → 全音数文本，如 7 → "3½" */
function wholeToneText(semitones: number): string {
  if (semitones === 0) return '0'
  const half = semitones % 2
  const whole = (semitones - half) / 2
  return half === 1 ? whole + '½' : String(whole)
}

function computeInterval(a: NoteSel, b: NoteSel): IntervalResult {
  const degree = ((b.letter - a.letter + 7) % 7) + 1
  const semitones = (pitchClass(b) - pitchClass(a) + 12) % 12

  const row = INTERVAL_TABLE[degree] || {}
  const name = row[semitones] || '不常见音程'

  let consonance = '不协和'
  if (PERFECT_SET.indexOf(name) >= 0) {
    consonance = '完全协和'
  } else if (IMPERFECT_SET.indexOf(name) >= 0) {
    consonance = '不完全协和'
  }

  /* 转位：度数 9-n，半音数 12-m */
  const invRow = INTERVAL_TABLE[9 - degree] || {}
  const inversion = invRow[12 - semitones] || '—'

  let tip = ''
  if (semitones === 6) {
    tip = '三全音：增四度与减五度互为等音程'
  } else if (name === '纯一度') {
    tip = '两音音高相同，不构成音程距离'
  }

  return {
    name,
    note1: noteName(a),
    note2: noteName(b),
    semitones,
    wholeToneText: wholeToneText(semitones),
    consonance,
    inversion,
    tip,
  }
}

const INIT_NOTE1: NoteSel = { letter: 0, acc: 0 }
const INIT_NOTE2: NoteSel = { letter: 4, acc: 0 }

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
    letters: LETTERS,
    accOptions: ACC_OPTIONS,
    note1: INIT_NOTE1,
    note2: INIT_NOTE2,
    result: computeInterval(INIT_NOTE1, INIT_NOTE2),
    refList: REF_LIST,
  },

  methods: {
    onLetter1(e: WechatMiniprogram.TouchEvent) {
      const note1: NoteSel = {
        letter: Number(e.currentTarget.dataset.index),
        acc: this.data.note1.acc,
      }
      this.setData({ note1, result: computeInterval(note1, this.data.note2) })
    },

    onAcc1(e: WechatMiniprogram.TouchEvent) {
      const note1: NoteSel = {
        letter: this.data.note1.letter,
        acc: Number(e.currentTarget.dataset.acc),
      }
      this.setData({ note1, result: computeInterval(note1, this.data.note2) })
    },

    onLetter2(e: WechatMiniprogram.TouchEvent) {
      const note2: NoteSel = {
        letter: Number(e.currentTarget.dataset.index),
        acc: this.data.note2.acc,
      }
      this.setData({ note2, result: computeInterval(this.data.note1, note2) })
    },

    onAcc2(e: WechatMiniprogram.TouchEvent) {
      const note2: NoteSel = {
        letter: this.data.note2.letter,
        acc: Number(e.currentTarget.dataset.acc),
      }
      this.setData({ note2, result: computeInterval(this.data.note1, note2) })
    },

    onSwap() {
      const { note1, note2 } = this.data
      this.setData({
        note1: note2,
        note2: note1,
        result: computeInterval(note2, note1),
      })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
