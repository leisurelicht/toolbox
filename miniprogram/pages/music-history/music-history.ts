interface Era {
  key: string
  region: string
  era: string
  name: string
  keywordsText: string
  figures: string
  desc: string
}

interface Region {
  id: string
  label: string
}

const REGIONS: Region[] = [
  { id: 'west', label: '西方' },
  { id: 'cn', label: '中国' },
]

const RAW_ERAS: Era[] = [
  /* ===== 西方 ===== */
  {
    key: 'w1', region: 'west', era: '约 500–1400', name: '中世纪',
    keywordsText: '格里高利圣咏 · 复调起源 · 教会调式',
    figures: '宾根、佩罗坦、马肖',
    desc: '音乐以教会仪式为核心，从单声圣咏发展出奥尔加农等复调形式，记谱法与调式理论逐步成熟。',
  },
  {
    key: 'w2', region: 'west', era: '约 1400–1600', name: '文艺复兴',
    keywordsText: '模仿复调 · 世俗歌曲 · 乐谱印刷',
    figures: '杜费、若斯坎、帕莱斯特里那、拉索',
    desc: '声乐复调达到高峰，织体均匀、声部平等；印刷术使乐谱大规模传播，世俗体裁兴盛。',
  },
  {
    key: 'w3', region: 'west', era: '1600–1750', name: '巴洛克',
    keywordsText: '通奏低音 · 歌剧诞生 · 协奏曲 · 赋格',
    figures: '蒙特威尔第、维瓦尔第、巴赫、亨德尔',
    desc: '以持续低音与和声框架为特征，戏剧性与装饰性并重，大小调体系与功能性和声确立。',
  },
  {
    key: 'w4', region: 'west', era: '1750–1820', name: '古典主义',
    keywordsText: '奏鸣曲式 · 交响曲 · 弦乐四重奏 · 公共音乐会',
    figures: '海顿、莫扎特、贝多芬',
    desc: '织体清澈、结构均衡，奏鸣曲式成为核心形式；音乐从宫廷走向公共音乐厅。',
  },
  {
    key: 'w5', region: 'west', era: '1820–1900', name: '浪漫主义',
    keywordsText: '标题音乐 · 艺术歌曲 · 民族乐派 · 乐剧',
    figures: '舒伯特、肖邦、李斯特、瓦格纳、勃拉姆斯、柴可夫斯基',
    desc: '强调个人情感与音色表现，和声语汇大幅扩展，体裁趋于自由、宏大，民族性成为重要主题。',
  },
  {
    key: 'w6', region: 'west', era: '1900–1945', name: '20 世纪上半叶',
    keywordsText: '无调性 · 十二音 · 新古典主义 · 爵士与民间素材',
    figures: '德彪西、斯特拉文斯基、勋伯格、巴托克',
    desc: '调性中心被质疑，节奏与音色实验活跃，爵士与民族音乐素材进入艺术音乐。',
  },
  {
    key: 'w7', region: 'west', era: '1945–', name: '战后与当代',
    keywordsText: '整体序列 · 偶然音乐 · 极简主义 · 电子音乐',
    figures: '布列兹、斯托克豪森、凯奇、赖希',
    desc: '创作观念高度多元，记谱与表演的边界被拓展，录音与电子技术成为音乐的一部分。',
  },

  /* ===== 中国 ===== */
  {
    key: 'c1', region: 'cn', era: '约前 11 世纪–前 221', name: '先秦',
    keywordsText: '编钟 · 雅乐 · 诗经 · 三分损益',
    figures: '师旷、伯牙',
    desc: '礼乐制度奠基，曾侯乙编钟显示高度发达的音律体系与青铜铸造技术，三分损益法成形。',
  },
  {
    key: 'c2', region: 'cn', era: '前 221–589', name: '汉魏六朝',
    keywordsText: '乐府 · 相和歌 · 清商乐 · 琵琶传入',
    figures: '李延年',
    desc: '民间音乐进入宫廷，西域乐器与乐调传入，南北音乐交融，乐府机构整理民间歌辞。',
  },
  {
    key: 'c3', region: 'cn', era: '581–907', name: '隋唐',
    keywordsText: '燕乐 · 歌舞大曲 · 教坊 · 胡乐融合',
    figures: '李龟年',
    desc: '多部乐与燕乐大曲繁盛，音乐机构（教坊、梨园）发达，敦煌琵琶谱等乐谱留存至今。',
  },
  {
    key: 'c4', region: 'cn', era: '960–1368', name: '宋元',
    keywordsText: '词调音乐 · 杂剧 · 南戏 · 琴乐',
    figures: '姜夔、关汉卿',
    desc: '说唱与戏曲兴起，文人琴乐与词乐成为重要传统，音乐与文学结合紧密。',
  },
  {
    key: 'c5', region: 'cn', era: '1368–1911', name: '明清',
    keywordsText: '昆曲 · 京剧 · 工尺谱 · 琴派',
    figures: '汤显祖、魏良辅',
    desc: '戏曲声腔体系成熟，器乐合奏与古琴流派传承有序，工尺谱成为通行的记谱方式。',
  },
  {
    key: 'c6', region: 'cn', era: '1840–1949', name: '近现代',
    keywordsText: '学堂乐歌 · 新音乐 · 专业音乐教育 · 民族管弦乐',
    figures: '萧友梅、黄自、刘天华',
    desc: '西方作曲技法与教育体系引入，专业音乐院校建立，中西融合的创作道路开始探索。',
  },
  {
    key: 'c7', region: 'cn', era: '1949–', name: '当代',
    keywordsText: '民族化创作 · 现代技法 · 非遗保护 · 跨文化',
    figures: '吴祖强、朱践耳、谭盾',
    desc: '从民族化探索走向现代技法与跨文化对话，传统音乐进入非物质文化遗产保护体系。',
  },
]

function pickEras(region: string): Era[] {
  return RAW_ERAS.filter((e) => e.region === region)
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

const INIT_REGION = 'west'

Component({
  data: {
    scrollHeight: 0,
    regions: REGIONS,
    activeRegion: INIT_REGION,
    eras: pickEras(INIT_REGION),
    count: pickEras(INIT_REGION).length,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onRegion(e: WechatMiniprogram.TouchEvent) {
      const region = e.currentTarget.dataset.region as string
      if (region === this.data.activeRegion) return
      const eras = pickEras(region)
      this.setData({ activeRegion: region, eras, count: eras.length })
    },
  },
})