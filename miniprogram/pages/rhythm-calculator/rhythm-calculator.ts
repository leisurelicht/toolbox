interface NoteValue {
  name: string
  beats: string
  ms: string
  hz: string
}

interface BarOption {
  label: string
  beats: number
}

const NOTE_DEFS = [
  { name: '全音符', beats: 4, label: '4' },
  { name: '附点二分', beats: 3, label: '3' },
  { name: '二分音符', beats: 2, label: '2' },
  { name: '附点四分', beats: 1.5, label: '1.5' },
  { name: '四分音符', beats: 1, label: '1' },
  { name: '附点八分', beats: 0.75, label: '0.75' },
  { name: '八分音符', beats: 0.5, label: '0.5' },
  { name: '十六分音符', beats: 0.25, label: '0.25' },
  { name: '三十二分', beats: 0.125, label: '0.125' },
  { name: '四分三连音', beats: 2 / 3, label: '2/3' },
  { name: '八分三连音', beats: 1 / 3, label: '1/3' },
]

const BAR_OPTIONS: BarOption[] = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 6 },
]

const PRESETS = [60, 72, 84, 96, 120, 144, 168]

const MIN_BPM = 20
const MAX_BPM = 300

function buildValues(bpm: number): NoteValue[] {
  return NOTE_DEFS.map((d) => {
    const ms = (d.beats * 60000) / bpm
    const hz = 1000 / ms
    return {
      name: d.name,
      beats: d.label,
      ms: ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : ms.toFixed(1) + ' ms',
      hz: hz.toFixed(2),
    }
  })
}

function barText(bpm: number, beats: number): string {
  const ms = (beats * 60000) / bpm
  return ms >= 1000 ? (ms / 1000).toFixed(2) + ' 秒' : ms.toFixed(0) + ' 毫秒'
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
    bpm: 120,
    presets: PRESETS,
    noteValues: buildValues(120),
    barOptions: BAR_OPTIONS,
    barIndex: 2,
    barMs: barText(120, 4),
  },

  methods: {
    apply(bpm: number, barIndex: number) {
      const safeBpm = Math.min(MAX_BPM, Math.max(MIN_BPM, bpm))
      this.setData({
        bpm: safeBpm,
        barIndex,
        noteValues: buildValues(safeBpm),
        barMs: barText(safeBpm, BAR_OPTIONS[barIndex].beats),
      })
    },

    onPreset(e: WechatMiniprogram.TouchEvent) {
      const bpm = Number(e.currentTarget.dataset.bpm)
      this.apply(bpm, this.data.barIndex)
    },

    onStep(e: WechatMiniprogram.TouchEvent) {
      const delta = Number(e.currentTarget.dataset.delta)
      this.apply(this.data.bpm + delta, this.data.barIndex)
    },

    onBar(e: WechatMiniprogram.TouchEvent) {
      const barIndex = Number(e.currentTarget.dataset.index)
      this.apply(this.data.bpm, barIndex)
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
