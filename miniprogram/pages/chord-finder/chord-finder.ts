interface NoteChip {
  pc: number
  name: string
  active: boolean
}

interface ChordMatch {
  key: string
  label: string
  full: string
  notesText: string
}

interface ChordTemplate {
  suffix: string
  offsets: number[]
  full: string
}

const PITCH_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

const TEMPLATES: ChordTemplate[] = [
  { suffix: '', offsets: [0, 4, 7], full: '大三和弦' },
  { suffix: 'm', offsets: [0, 3, 7], full: '小三和弦' },
  { suffix: 'dim', offsets: [0, 3, 6], full: '减三和弦' },
  { suffix: 'aug', offsets: [0, 4, 8], full: '增三和弦' },
  { suffix: 'sus4', offsets: [0, 5, 7], full: '挂四和弦' },
  { suffix: 'sus2', offsets: [0, 2, 7], full: '挂二和弦' },
  { suffix: 'maj7', offsets: [0, 4, 7, 11], full: '大七和弦' },
  { suffix: '7', offsets: [0, 4, 7, 10], full: '属七和弦' },
  { suffix: 'm7', offsets: [0, 3, 7, 10], full: '小七和弦' },
  { suffix: 'm7♭5', offsets: [0, 3, 6, 10], full: '半减七和弦' },
  { suffix: 'dim7', offsets: [0, 3, 6, 9], full: '减七和弦' },
  { suffix: 'mMaj7', offsets: [0, 3, 7, 11], full: '小大七和弦' },
  { suffix: 'maj7♯5', offsets: [0, 4, 8, 11], full: '增大七和弦' },
  { suffix: '6', offsets: [0, 4, 7, 9], full: '大六和弦' },
  { suffix: 'm6', offsets: [0, 3, 7, 9], full: '小六和弦' },
  { suffix: '7sus4', offsets: [0, 5, 7, 10], full: '属七挂四' },
  { suffix: 'add9', offsets: [0, 2, 4, 7], full: '加九和弦' },
  { suffix: 'maj9', offsets: [0, 2, 4, 7, 11], full: '大九和弦' },
  { suffix: '9', offsets: [0, 2, 4, 7, 10], full: '属九和弦' },
  { suffix: 'm9', offsets: [0, 2, 3, 7, 10], full: '小九和弦' },
]

const MAX_RESULTS = 10

function buildNotes(): NoteChip[] {
  return PITCH_NAMES.map((name, pc) => {
    return { pc, name, active: false }
  })
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function matchChords(selected: number[]): ChordMatch[] {
  const picked = selected.slice().sort((a, b) => a - b)
  const matches: ChordMatch[] = []

  for (let t = 0; t < TEMPLATES.length; t++) {
    const tpl = TEMPLATES[t]
    for (let root = 0; root < 12; root++) {
      const pcs: number[] = []
      for (let i = 0; i < tpl.offsets.length; i++) {
        pcs.push((root + tpl.offsets[i]) % 12)
      }
      pcs.sort((a, b) => a - b)
      if (!sameSet(pcs, picked)) continue

      const notesText = tpl.offsets.map((o) => PITCH_NAMES[(root + o) % 12]).join(' ')
      matches.push({
        key: PITCH_NAMES[root] + tpl.suffix,
        label: PITCH_NAMES[root] + tpl.suffix,
        full: PITCH_NAMES[root] + ' ' + tpl.full,
        notesText,
      })
      if (matches.length >= MAX_RESULTS) return matches
    }
  }
  return matches
}

function emptyTextOf(count: number, matched: number): string {
  if (count < 3) return '至少选择 3 个音开始识别'
  if (matched === 0) return '未匹配到常见和弦'
  return ''
}

const INIT_NOTES = buildNotes()

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
    notes: INIT_NOTES,
    matches: [] as ChordMatch[],
    selectedCount: 0,
    emptyText: '至少选择 3 个音开始识别',
  },

  methods: {
    onToggle(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const notes = this.data.notes.map((n, i) => {
        if (i === index) {
          return { pc: n.pc, name: n.name, active: !n.active }
        }
        return n
      })

      const picked: number[] = []
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].active) picked.push(notes[i].pc)
      }

      const matches = picked.length === 0 ? [] : matchChords(picked)
      this.setData({
        notes,
        matches,
        selectedCount: picked.length,
        emptyText: emptyTextOf(picked.length, matches.length),
      })
    },

    onClear() {
      this.setData({
        notes: buildNotes(),
        matches: [],
        selectedCount: 0,
        emptyText: '至少选择 3 个音开始识别',
      })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
