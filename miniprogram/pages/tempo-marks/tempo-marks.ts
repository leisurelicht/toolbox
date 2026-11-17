interface TempoMark {
  term: string
  zh: string
  rangeText: string
  leftPct: string
  widthPct: string
}

interface Modifier {
  term: string
  zh: string
}

const MIN_BPM = 20
const MAX_BPM = 220

const RAW_MARKS = [
  { term: 'Larghissimo', zh: '极缓慢', min: 20, max: 40 },
  { term: 'Grave', zh: '庄板，沉重庄严', min: 25, max: 45 },
  { term: 'Largo', zh: '广板，宽广舒缓', min: 40, max: 60 },
  { term: 'Lento', zh: '慢板', min: 45, max: 60 },
  { term: 'Larghetto', zh: '小广板', min: 50, max: 66 },
  { term: 'Adagio', zh: '柔板，从容', min: 60, max: 76 },
  { term: 'Adagietto', zh: '小柔板', min: 66, max: 80 },
  { term: 'Andante', zh: '行板，近似步行', min: 76, max: 108 },
  { term: 'Andantino', zh: '小行板', min: 80, max: 108 },
  { term: 'Marcia moderato', zh: '中速进行曲', min: 84, max: 100 },
  { term: 'Moderato', zh: '中板', min: 108, max: 120 },
  { term: 'Allegretto', zh: '小快板', min: 112, max: 120 },
  { term: 'Allegro', zh: '快板', min: 120, max: 156 },
  { term: 'Vivace', zh: '活泼地', min: 140, max: 176 },
  { term: 'Presto', zh: '急板', min: 168, max: 200 },
  { term: 'Prestissimo', zh: '最急板', min: 188, max: 220 },
]

function toPct(v: number): string {
  const p = ((v - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100
  return (Math.round(p * 100) / 100).toFixed(2)
}

/* 区间长度占整条轴的比例 */
function spanPct(v: number): string {
  const p = (v / (MAX_BPM - MIN_BPM)) * 100
  return (Math.round(p * 100) / 100).toFixed(2)
}

const MARKS: TempoMark[] = RAW_MARKS.map((m) => {
  return {
    term: m.term,
    zh: m.zh,
    rangeText: m.min + '–' + m.max,
    leftPct: toPct(m.min),
    widthPct: spanPct(m.max - m.min),
  }
})

const MODIFIERS: Modifier[] = [
  { term: 'molto', zh: '很、非常' },
  { term: 'meno', zh: '较少一些' },
  { term: 'più', zh: '更多一些' },
  { term: 'poco a poco', zh: '逐渐地' },
  { term: 'non troppo', zh: '不过分地' },
  { term: 'con moto', zh: '稍带流动' },
  { term: 'sempre', zh: '始终' },
  { term: 'subito', zh: '突然地' },
]

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
    marks: MARKS,
    modifiers: MODIFIERS,
    axis: ['20', '60', '120', '180', '220'],
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
