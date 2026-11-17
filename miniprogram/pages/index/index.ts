interface Tool {
  id: string
  name: string
  symbol: string
  description: string
  iconBg: string
  iconColor: string
  borderColor: string
  comingSoon: boolean
  path: string
  /** 音乐类子分类 id：theory / calc / ref / train；日常类不填 */
  sub?: string
}

interface SubCategory {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  icon: string
  /** 二级分类；空数组表示该分类不做二级筛选 */
  subcats: SubCategory[]
  tools: Tool[]
}

const ALL_CATEGORIES: Category[] = [
  {
    id: 'music',
    name: '音乐',
    icon: '🎵',
    subcats: [
      { id: 'theory', name: '乐理基础' },
      { id: 'calc', name: '计算工具' },
      { id: 'ref', name: '术语参考' },
      { id: 'train', name: '训练历史' },
    ],
    tools: [
      {
        id: 'metronome',
        name: '节拍器',
        symbol: '节',
        description: 'BPM、拍号与重拍强调',
        sub: 'train',
        iconBg: '#FFEBEE',
        iconColor: '#D32F2F',
        borderColor: '#FFCDD2',
        comingSoon: false,
        path: '/pages/metronome/metronome',
      },
      {
        id: 'ear-training',
        name: '练耳训练',
        symbol: '♫',
        description: '音程听辨，旋律与和声',
        sub: 'train',
        iconBg: '#FFF1F2',
        iconColor: '#BE123C',
        borderColor: '#FECDD3',
        comingSoon: false,
        path: '/pages/ear-training/ear-training',
      },
      {
        id: 'key-signature',
        name: '调号速查',
        symbol: '♯',
        description: '15个大小调号一览，含中德对照',
        sub: 'theory',
        iconBg: '#FFF0E6',
        iconColor: '#E87A2A',
        borderColor: '#FFE8CC',
        comingSoon: false,
        path: '/pages/key-signature/key-signature',
      },
      {
        id: 'note-names',
        name: '音名对照',
        symbol: 'CD',
        description: '英德法意中五语种音名互查',
        sub: 'theory',
        iconBg: '#EEF2FF',
        iconColor: '#4C6EF5',
        borderColor: '#DBE4FF',
        comingSoon: false,
        path: '/pages/note-names/note-names',
      },
      {
        id: 'pitch-frequency',
        name: '频率对照',
        symbol: 'Hz',
        description: 'C0–B8 全音域频率，多律制切换',
        sub: 'calc',
        iconBg: '#E8F5E9',
        iconColor: '#2E7D32',
        borderColor: '#C8E6C9',
        comingSoon: false,
        path: '/pages/pitch-frequency/pitch-frequency',
      },
      {
        id: 'interval-calculator',
        name: '音程计算',
        symbol: 'P5',
        description: '两音定音程，含转位与协和性',
        sub: 'calc',
        iconBg: '#E0F2FE',
        iconColor: '#0369A1',
        borderColor: '#BAE6FD',
        comingSoon: false,
        path: '/pages/interval-calculator/interval-calculator',
      },
      {
        id: 'music-terms',
        name: '术语词典',
        symbol: '词',
        description: '意德法速度与表情术语速查',
        sub: 'ref',
        iconBg: '#F3E8FF',
        iconColor: '#7C3AED',
        borderColor: '#E9D5FF',
        comingSoon: false,
        path: '/pages/music-terms/music-terms',
      },
      {
        id: 'ornaments',
        name: '装饰音记号',
        symbol: 'tr',
        description: '装饰音与演奏记号速查',
        sub: 'theory',
        iconBg: '#F0FDF4',
        iconColor: '#15803D',
        borderColor: '#BBF7D0',
        comingSoon: false,
        path: '/pages/ornaments/ornaments',
      },
      {
        id: 'modes-scales',
        name: '调式音阶',
        symbol: '阶',
        description: '七种教会调式与小调音阶',
        sub: 'theory',
        iconBg: '#FEF3C7',
        iconColor: '#B45309',
        borderColor: '#FDE68A',
        comingSoon: false,
        path: '/pages/modes-scales/modes-scales',
      },
      {
        id: 'transpose',
        name: '移调',
        symbol: '移',
        description: '调性移调与移调乐器对照',
        sub: 'calc',
        iconBg: '#E0F7FA',
        iconColor: '#00838F',
        borderColor: '#B2EBF2',
        comingSoon: false,
        path: '/pages/transpose/transpose',
      },
      {
        id: 'chord-finder',
        name: '和弦反查',
        symbol: 'Cm',
        description: '点选音高，识别和弦名称',
        sub: 'calc',
        iconBg: '#FCE4EC',
        iconColor: '#C2185B',
        borderColor: '#F8BBD0',
        comingSoon: false,
        path: '/pages/chord-finder/chord-finder',
      },
      {
        id: 'circle-of-fifths',
        name: '五度圈',
        symbol: '5°',
        description: '12 调环形对照，含近关系调',
        sub: 'theory',
        iconBg: '#E8EAF6',
        iconColor: '#3949AB',
        borderColor: '#C5CAE9',
        comingSoon: false,
        path: '/pages/circle-of-fifths/circle-of-fifths',
      },
      {
        id: 'tuning-cents',
        name: '音分律制',
        symbol: '¢',
        description: '三律对照与频率音分换算',
        sub: 'calc',
        iconBg: '#F1F8E9',
        iconColor: '#558B2F',
        borderColor: '#DCEDC8',
        comingSoon: false,
        path: '/pages/tuning-cents/tuning-cents',
      },
      {
        id: 'clefs',
        name: '谱号音位',
        symbol: '谱',
        description: '四种谱号的线与间音名',
        sub: 'theory',
        iconBg: '#FFF3E0',
        iconColor: '#EF6C00',
        borderColor: '#FFE0B2',
        comingSoon: false,
        path: '/pages/clefs/clefs',
      },
      {
        id: 'tempo-marks',
        name: '速度对照',
        symbol: '♩',
        description: '速度术语对应的 BPM 区间',
        sub: 'ref',
        iconBg: '#EDE7F6',
        iconColor: '#5E35B1',
        borderColor: '#D1C4E9',
        comingSoon: false,
        path: '/pages/tempo-marks/tempo-marks',
      },
      {
        id: 'rhythm-calculator',
        name: '时值计算',
        symbol: 'ms',
        description: 'BPM 换算各音符毫秒时值',
        sub: 'calc',
        iconBg: '#E0F2F1',
        iconColor: '#00695C',
        borderColor: '#B2DFDB',
        comingSoon: false,
        path: '/pages/rhythm-calculator/rhythm-calculator',
      },
      {
        id: 'instrument-range',
        name: '乐器音域',
        symbol: '域',
        description: '各乐器常用音域横向对照',
        sub: 'ref',
        iconBg: '#FFF8E1',
        iconColor: '#F9A825',
        borderColor: '#FFECB3',
        comingSoon: false,
        path: '/pages/instrument-range/instrument-range',
      },
      {
        id: 'music-history',
        name: '音乐史年表',
        symbol: '史',
        description: '西方与中国音乐史分期',
        sub: 'train',
        iconBg: '#FDF6EC',
        iconColor: '#92400E',
        borderColor: '#FDE5C0',
        comingSoon: false,
        path: '/pages/music-history/music-history',
      },
    ],
  },
  {
    id: 'daily',
    name: '日常',
    icon: '🛠',
    subcats: [],
    tools: [
      {
        id: 'counter',
        name: '计数器',
        symbol: '计',
        description: '点击计数，轻松统计',
        iconBg: '#EEF2FF',
        iconColor: '#4C6EF5',
        borderColor: '#DBE4FF',
        comingSoon: false,
        path: '/pages/counter/counter',
      },
      {
        id: 'random',
        name: '随机数',
        symbol: '?',
        description: '随机生成，趣味抽签',
        iconBg: '#FFF0E6',
        iconColor: '#F76707',
        borderColor: '#FFE8CC',
        comingSoon: false,
        path: '/pages/random/random',
      },
      {
        id: 'what-to-eat',
        name: '吃点啥',
        symbol: '吃',
        description: '选择困难症救星，一键决定吃什么',
        iconBg: '#FFF4E6',
        iconColor: '#E8590C',
        borderColor: '#FFE0C2',
        comingSoon: false,
        path: '/pages/what-to-eat/what-to-eat',
      },
      {
        id: 'date-calc',
        name: '日期计算',
        symbol: '日',
        description: '日期差、推算、倒数日与保质期',
        iconBg: '#E0F2FE',
        iconColor: '#0369A1',
        borderColor: '#BAE6FD',
        comingSoon: false,
        path: '/pages/date-calc/date-calc',
      },
      {
        id: 'bill-calc',
        name: '算账',
        symbol: '¥',
        description: 'AA、满减、单价与分期年化',
        iconBg: '#ECFDF5',
        iconColor: '#0F766E',
        borderColor: '#A7F3D0',
        comingSoon: false,
        path: '/pages/bill-calc/bill-calc',
      },
      {
        id: 'unit-convert',
        name: '单位换算',
        symbol: '换',
        description: '市制、英制、温度与厨房单位',
        iconBg: '#F5F3FF',
        iconColor: '#7C3AED',
        borderColor: '#DDD6FE',
        comingSoon: false,
        path: '/pages/unit-convert/unit-convert',
      },
      {
        id: 'packing-list',
        name: '旅行打包',
        symbol: '包',
        description: '按行程和天气生成，勾选不遗漏',
        iconBg: '#FFF7ED',
        iconColor: '#C2410C',
        borderColor: '#FED7AA',
        comingSoon: false,
        path: '/pages/packing-list/packing-list',
      },
      {
        id: 'fund-premium',
        name: '涨了吗',
        symbol: '涨',
        description: '溢价监控',
        iconBg: '#FFF1F0',
        iconColor: '#E8453C',
        borderColor: '#FFD8D6',
        comingSoon: false,
        path: '/pages/fund-premium/fund-premium',
      },
    ],
  },
]

function countTools(cats: Category[]): number {
  return cats.reduce((sum, c) => sum + c.tools.length, 0)
}

const SUBCAT_ALL: SubCategory = { id: 'all', name: '全部' }

function subcatsOf(cat: Category): SubCategory[] {
  return [SUBCAT_ALL].concat(cat.subcats)
}

function filterTools(cat: Category, sub: string): Tool[] {
  if (sub === 'all') return cat.tools
  return cat.tools.filter((t) => t.sub === sub)
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
      /* 兜底估算：导航栏 44px + 状态栏 + Hero/Tab 约 366rpx */
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 366 * rpx)
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    categories: ALL_CATEGORIES as Category[],
    totalCount: countTools(ALL_CATEGORIES),
    activeCategory: ALL_CATEGORIES[0].id,
    activeIndex: 0,
    activeSub: 'all',
    hasSub: ALL_CATEGORIES[0].subcats.length > 0,
    subcats: subcatsOf(ALL_CATEGORIES[0]),
    activeTools: ALL_CATEGORIES[0].tools as Tool[],
    scrollHeight: 0,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 0 })
      }
    },
  },

  methods: {
    onTabChange(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as string
      const index = ALL_CATEGORIES.findIndex((c) => c.id === id)
      if (index < 0) return
      const cat = ALL_CATEGORIES[index]
      this.setData(
        {
          activeCategory: id,
          activeIndex: index,
          activeSub: 'all',
          hasSub: cat.subcats.length > 0,
          subcats: subcatsOf(cat),
          activeTools: cat.tools,
        },
        () => {
          /* 顶栏高度随二级分类出现/消失而变化，需要重新测滚动区 */
          wx.nextTick(() => applyScrollHeight(this))
        }
      )
    },

    onSubChange(e: WechatMiniprogram.TouchEvent) {
      const sub = e.currentTarget.dataset.sub as string
      if (sub === this.data.activeSub) return
      const cat = ALL_CATEGORIES[this.data.activeIndex]
      if (!cat) return
      this.setData({ activeSub: sub, activeTools: filterTools(cat, sub) })
    },

    onToolTap(e: WechatMiniprogram.TouchEvent) {
      const { tool } = e.currentTarget.dataset as { tool: Tool }

      if (tool.comingSoon) {
        wx.showToast({
          title: '即将上线，敬请期待',
          icon: 'none',
          duration: 1500,
        })
        return
      }

      wx.navigateTo({ url: tool.path })
    },
  },
})