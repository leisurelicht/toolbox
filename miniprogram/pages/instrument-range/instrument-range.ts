interface InstrRaw {
  name: string
  family: string
  low: number
  high: number
  desc: string
}

interface Instr {
  name: string
  family: string
  lowText: string
  highText: string
  desc: string
  leftPct: string
  widthPct: string
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const LOW_MIDI = 21
const HIGH_MIDI = 108
const SPAN = HIGH_MIDI - LOW_MIDI

const FAMILIES = ['全部', '弦乐', '木管', '铜管', '键盘', '人声']

const RAW: InstrRaw[] = [
  { name: '小提琴', family: '弦乐', low: 55, high: 100, desc: '最低 G3，高音区常用至 E7' },
  { name: '中提琴', family: '弦乐', low: 48, high: 88, desc: '比小提琴低一个五度' },
  { name: '大提琴', family: '弦乐', low: 36, high: 81, desc: '最低 C2，高音区用次中音谱号' },
  { name: '低音提琴', family: '弦乐', low: 28, high: 67, desc: '记谱比实音高八度' },
  { name: '长笛', family: '木管', low: 60, high: 96, desc: 'C4–C7，最高音域常见于现代作品' },
  { name: '双簧管', family: '木管', low: 58, high: 93, desc: 'B♭3–A6' },
  { name: 'B♭ 单簧管', family: '木管', low: 50, high: 90, desc: '所示实音音域，记谱高大二度' },
  { name: '巴松', family: '木管', low: 34, high: 75, desc: 'B♭1–E♭5，低音区极有特色' },
  { name: 'F 圆号', family: '铜管', low: 34, high: 77, desc: '所示实音音域，记谱高纯五度' },
  { name: 'B♭ 小号', family: '铜管', low: 52, high: 82, desc: '所示实音音域，记谱高大二度' },
  { name: '长号', family: '铜管', low: 40, high: 72, desc: 'E2–C5，非移调乐器' },
  { name: '大号', family: '铜管', low: 28, high: 58, desc: 'E1–B♭3，乐队最低音' },
  { name: '钢琴', family: '键盘', low: 21, high: 108, desc: 'A0–C8，共 88 键' },
  { name: '女高音', family: '人声', low: 60, high: 84, desc: 'C4–C6，常用音域' },
  { name: '女中音', family: '人声', low: 55, high: 79, desc: 'G3–G5' },
  { name: '男高音', family: '人声', low: 48, high: 69, desc: 'C3–A4' },
  { name: '男低音', family: '人声', low: 40, high: 64, desc: 'E2–E4' },
]

function midiName(midi: number): string {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1)
}

function pct(v: number): string {
  const p = (v / SPAN) * 100
  return (Math.round(p * 100) / 100).toFixed(2)
}

function buildList(family: string): Instr[] {
  const list: Instr[] = []
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i]
    if (family !== '全部' && r.family !== family) continue
    list.push({
      name: r.name,
      family: r.family,
      lowText: midiName(r.low),
      highText: midiName(r.high),
      desc: r.desc,
      leftPct: pct(r.low - LOW_MIDI),
      widthPct: pct(r.high - r.low),
    })
  }
  return list
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
    families: FAMILIES,
    activeFamily: '全部',
    list: buildList('全部'),
    axis: ['A0', 'C2', 'C4', 'C6', 'C8'],
  },

  methods: {
    onFamily(e: WechatMiniprogram.TouchEvent) {
      const family = e.currentTarget.dataset.family as string
      if (family === this.data.activeFamily) return
      this.setData({ activeFamily: family, list: buildList(family) })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
