interface KeyRow {
  major: string
  minor: string
  sharps: number
  flats: number
  acc: string
  signature: string
}

interface MajorNode {
  label: string
  index: number
  left: number
  top: number
}

interface MinorNode {
  label: string
  index: number
  left: number
  top: number
}

/* 五度圈顺时针顺序：C G D A E B F♯ D♭ A♭ E♭ B♭ F */
const KEYS: KeyRow[] = [
  { major: 'C', minor: 'Am', sharps: 0, flats: 0, acc: '', signature: '无升降号' },
  { major: 'G', minor: 'Em', sharps: 1, flats: 0, acc: '♯', signature: '1 个升号' },
  { major: 'D', minor: 'Bm', sharps: 2, flats: 0, acc: '♯♯', signature: '2 个升号' },
  { major: 'A', minor: 'F♯m', sharps: 3, flats: 0, acc: '♯♯♯', signature: '3 个升号' },
  { major: 'E', minor: 'C♯m', sharps: 4, flats: 0, acc: '♯♯♯♯', signature: '4 个升号' },
  { major: 'B', minor: 'G♯m', sharps: 5, flats: 0, acc: '♯♯♯♯♯', signature: '5 个升号' },
  { major: 'F♯', minor: 'D♯m', sharps: 6, flats: 0, acc: '♯♯♯♯♯♯', signature: '6 个升号' },
  { major: 'D♭', minor: 'B♭m', sharps: 0, flats: 5, acc: '♭♭♭♭♭', signature: '5 个降号' },
  { major: 'A♭', minor: 'Fm', sharps: 0, flats: 4, acc: '♭♭♭♭', signature: '4 个降号' },
  { major: 'E♭', minor: 'Cm', sharps: 0, flats: 3, acc: '♭♭♭', signature: '3 个降号' },
  { major: 'B♭', minor: 'Gm', sharps: 0, flats: 2, acc: '♭♭', signature: '2 个降号' },
  { major: 'F', minor: 'Dm', sharps: 0, flats: 1, acc: '♭', signature: '1 个降号' },
]

const RING = 686
const CENTER = 343
const OUTER_R = 250
const OUTER_NODE = 84
const INNER_R = 150
const INNER_NODE = 62
const STEP_DEG = 30
const START_DEG = -90

function radiusAngle(i: number): number {
  return ((i * STEP_DEG + START_DEG) * Math.PI) / 180
}

function buildMajorNodes(): MajorNode[] {
  return KEYS.map((k, i) => {
    const a = radiusAngle(i)
    return {
      label: k.major,
      index: i,
      left: Math.round(CENTER + OUTER_R * Math.cos(a) - OUTER_NODE / 2),
      top: Math.round(CENTER + OUTER_R * Math.sin(a) - OUTER_NODE / 2),
    }
  })
}

function buildMinorNodes(): MinorNode[] {
  return KEYS.map((k, i) => {
    const a = radiusAngle(i)
    return {
      label: k.minor,
      index: i,
      left: Math.round(CENTER + INNER_R * Math.cos(a) - INNER_NODE / 2),
      top: Math.round(CENTER + INNER_R * Math.sin(a) - INNER_NODE / 2),
    }
  })
}

function neighborLabel(index: number, offset: number): string {
  const i = (index + offset + 12) % 12
  return KEYS[i].major
}

const MAJOR_NODES = buildMajorNodes()
const MINOR_NODES = buildMinorNodes()

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
    ringSize: RING,
    majorSize: OUTER_NODE,
    minorSize: INNER_NODE,
    majors: MAJOR_NODES,
    minors: MINOR_NODES,
    activeIndex: 0,
    current: KEYS[0],
    dominant: neighborLabel(0, 1),
    subdominant: neighborLabel(0, -1),
  },

  methods: {
    onSelect(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const key = KEYS[index]
      if (!key) return
      this.setData({
        activeIndex: index,
        current: key,
        dominant: neighborLabel(index, 1),
        subdominant: neighborLabel(index, -1),
      })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
