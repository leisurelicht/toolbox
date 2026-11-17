interface Pulse {
  key: string
  cls: string
}

interface Signature {
  key: string
  label: string
  name: string
  group: string
  feelText: string
  pulses: Pulse[]
  genres: string
  desc: string
}

const CATS = ['全部', '简单拍子', '复合拍子', '混合拍子']

/* 2 = 强拍, 1 = 次强拍, 0 = 弱拍 */
function buildPulses(levels: number[], key: string): Pulse[] {
  return levels.map((lv, i) => {
    let cls = 'weak'
    if (lv === 2) cls = 'strong'
    if (lv === 1) cls = 'medium'
    return { key: key + '-p' + i, cls }
  })
}

const RAW = [
  {
    key: 't1', label: '2/4', name: '四二拍', group: '简单拍子',
    levels: [2, 0], feelText: '强 · 弱', genres: '进行曲、波尔卡、儿童歌曲',
    desc: '每小节两拍，节奏干脆有力，适合步伐感强的音乐。',
  },
  {
    key: 't2', label: '3/4', name: '四三拍', group: '简单拍子',
    levels: [2, 0, 0], feelText: '强 · 弱 · 弱', genres: '圆舞曲、小步舞曲、玛祖卡',
    desc: '每小节三拍，第一拍重音突出，是典型的三拍子流动感。',
  },
  {
    key: 't3', label: '4/4', name: '四四拍', group: '简单拍子',
    levels: [2, 0, 1, 0], feelText: '强 · 弱 · 次强 · 弱', genres: '流行、摇滚、交响曲、室内乐',
    desc: '最常见的拍号，又称「普通拍子」，四个层级分明便于组织乐句。',
  },
  {
    key: 't4', label: '2/2', name: '二二拍（alla breve）', group: '简单拍子',
    levels: [2, 0], feelText: '强 · 弱（以二分音符为一拍）', genres: '进行曲、古典快板乐章',
    desc: '又称「cut time」，速度标记相同但每拍时值为二分音符，听感更快、更有推进力。',
  },
  {
    key: 't5', label: '6/8', name: '八六拍', group: '复合拍子',
    levels: [2, 0, 0, 1, 0, 0], feelText: '强 · 弱 · 弱 · 次强 · 弱 · 弱', genres: '摇篮曲、船歌、塔兰泰拉',
    desc: '两组三连音构成，复合二拍子，兼具流动与摇摆感。',
  },
  {
    key: 't6', label: '9/8', name: '八九拍', group: '复合拍子',
    levels: [2, 0, 0, 1, 0, 0, 1, 0, 0], feelText: '强 · 弱 · 弱 × 3', genres: '慢速抒情曲、部分民间舞曲',
    desc: '三组三连音构成，复合三拍子，气息舒展。',
  },
  {
    key: 't7', label: '12/8', name: '八十二拍', group: '复合拍子',
    levels: [2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], feelText: '强 · 弱 · 弱 × 4', genres: '布鲁斯、慢摇、宗教合唱',
    desc: '四组三连音构成，复合四拍子，是布鲁斯与灵魂乐的基础律动。',
  },
  {
    key: 't8', label: '5/4', name: '四五拍', group: '混合拍子',
    levels: [2, 0, 1, 0, 0], feelText: '强 · 弱 · 次强 · 弱 · 弱（3+2）', genres: '爵士、现代作品',
    desc: '奇數拍子的典型代表，常按 3+2 或 2+3 分组，爵士名曲《Take Five》即用此拍。',
  },
  {
    key: 't9', label: '7/8', name: '八七拍', group: '混合拍子',
    levels: [2, 0, 0, 1, 0, 0, 0], feelText: '强 · 弱 · 弱 · 次强 · 弱 · 弱 · 弱（2+2+3）', genres: '巴尔干民间音乐、现代作品',
    desc: '不对称拍号，常按 2+2+3 或 3+2+2 分组，是东欧民间音乐的重要特征。',
  },
] as Array<{
  key: string
  label: string
  name: string
  group: string
  levels: number[]
  feelText: string
  genres: string
  desc: string
}>

const ALL: Signature[] = RAW.map((r) => {
  return {
    key: r.key,
    label: r.label,
    name: r.name,
    group: r.group,
    feelText: r.feelText,
    pulses: buildPulses(r.levels, r.key),
    genres: r.genres,
    desc: r.desc,
  }
})

function pickList(cat: string): Signature[] {
  if (cat === '全部') return ALL
  return ALL.filter((t) => t.group === cat)
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
    cats: CATS,
    activeCat: '全部',
    visible: ALL,
    count: ALL.length,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onCat(e: WechatMiniprogram.TouchEvent) {
      const cat = e.currentTarget.dataset.cat as string
      const visible = pickList(cat)
      this.setData({ activeCat: cat, visible, count: visible.length })
    },
  },
})