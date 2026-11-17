interface PartChip {
  key: string
  label: string
}

interface FormItem {
  key: string
  name: string
  structure: string
  parts: PartChip[]
  desc: string
  examples: string
}

const RAW = [
  {
    key: 'f1', name: '二部曲式', structure: 'A – B',
    parts: ['A', 'B'],
    desc: '由两个性质不同的段落构成，常用收束与对比形成呼应，段落可各自反复。',
    examples: '巴赫小步舞曲、舒伯特艺术歌曲、多数流行歌曲的主歌—副歌',
  },
  {
    key: 'f2', name: '三部曲式', structure: 'A – B – A',
    parts: ['A', 'B', 'A'],
    desc: '再现三部性结构：首段陈述、中段对比、末段再现，是古典器乐最常见的框架。',
    examples: '肖邦夜曲、门德尔松《无词歌》、几乎所有小步舞曲乐章',
  },
  {
    key: 'f3', name: '复三部曲式', structure: 'A – B – A（各部分自成二/三部）',
    parts: ['A', 'B', 'A'],
    desc: '三段各自规模较大、内部又有独立结构，常见于谐谑曲、圆舞曲与进行曲的中段。',
    examples: '肖邦谐谑曲、柴可夫斯基圆舞曲、施特劳斯圆舞曲套曲',
  },
  {
    key: 'f4', name: '奏鸣曲式', structure: '呈示部 – 展开部 – 再现部',
    parts: ['呈示部', '展开部', '再现部'],
    desc: '两个对比主题在主调与属调上呈现，展开部对主题作分裂与发展，再现部回到主调。可能带引子与尾声。',
    examples: '贝多芬交响曲第一乐章、莫扎特奏鸣曲、多数古典协奏曲',
  },
  {
    key: 'f5', name: '奏鸣回旋曲式', structure: '呈示 – 插部 – 再现 – 插部 – 再现',
    parts: ['呈示', '插部', '再现', '插部', '再现'],
    desc: '奏鸣曲式与回旋曲式的结合，兼具主题对峙与回旋往复，常用于终曲。',
    examples: '古典奏鸣曲与室内乐的末乐章',
  },
  {
    key: 'f6', name: '回旋曲式', structure: 'A – B – A – C – A',
    parts: ['A', 'B', 'A', 'C', 'A'],
    desc: '主部主题反复出现，之间插入不同插部，形成「回到—离开—回到」的循环感。',
    examples: '库普兰回旋曲、贝多芬《致爱丽丝》、奏鸣曲末乐章',
  },
  {
    key: 'f7', name: '变奏曲式', structure: 'A – A1 – A2 – A3 …',
    parts: ['主题', '变奏 1', '变奏 2', '…'],
    desc: '主题重复变形，可在旋律、和声、节奏、织体、调性上逐层展衍，常发展为变奏套曲。',
    examples: '巴赫《哥德堡变奏曲》、贝多芬《迪亚贝利变奏曲》',
  },
  {
    key: 'f8', name: '赋格', structure: '主题 – 答题 – 对题 – 插部',
    parts: ['主题', '答题', '对题', '插部'],
    desc: '以单一主题在多个声部依次进入、交织模仿的复调结构，常含呈示部、中间部与再现部。',
    examples: '巴赫《平均律》赋格、赋格的艺术',
  },
  {
    key: 'f9', name: '固定低音变奏', structure: '低音 Ostinato 重复 + 上方变奏',
    parts: ['固定低音', '变奏 1', '变奏 2', '…'],
    desc: '低音短句（或和声进行）在整曲中反复，上方声部作连续变奏，即帕萨卡利亚与恰空的典型手法。',
    examples: '巴赫恰空、帕萨卡利亚与赋格、布里顿《青年管弦乐指南》',
  },
  {
    key: 'f10', name: '分节歌', structure: '同一旋律 × 多段歌词',
    parts: ['旋律', '歌词 1', '歌词 2', '…'],
    desc: '多处歌词共用一段旋律，常见于民歌与艺术歌曲；若各段音乐不同则称通谱体。',
    examples: '舒伯特《野玫瑰》、民歌、合唱曲',
  },
]

const FORMS: FormItem[] = RAW.map((r) => {
  const parts: PartChip[] = r.parts.map((label, i) => {
    return { key: r.key + '-p' + i, label }
  })
  return {
    key: r.key,
    name: r.name,
    structure: r.structure,
    parts,
    desc: r.desc,
    examples: r.examples,
  }
})

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
    forms: FORMS,
    count: FORMS.length,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})