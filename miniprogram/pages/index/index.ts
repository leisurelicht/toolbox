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
}

interface Category {
  id: string
  name: string
  icon: string
  tools: Tool[]
}

const ALL_CATEGORIES: Category[] = [
  {
    id: 'daily',
    name: '日常',
    icon: '🛠',
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
    ],
  },
  {
    id: 'music',
    name: '音乐',
    icon: '🎵',
    tools: [
      {
        id: 'key-signature',
        name: '调号速查',
        symbol: '♯',
        description: '15个大小调号一览，含中德对照',
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
        iconBg: '#E8F5E9',
        iconColor: '#2E7D32',
        borderColor: '#C8E6C9',
        comingSoon: false,
        path: '/pages/pitch-frequency/pitch-frequency',
      },
    ],
  },
]

function countTools(cats: Category[]): number {
  return cats.reduce((sum, c) => sum + c.tools.length, 0)
}

Component({
  data: {
    categories: ALL_CATEGORIES as Category[],
    totalCount: countTools(ALL_CATEGORIES),
    activeCategory: ALL_CATEGORIES[0].id,
    activeIndex: 0,
    activeTools: ALL_CATEGORIES[0].tools as Tool[],
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
      const { id } = e.currentTarget.dataset
      const index = ALL_CATEGORIES.findIndex(c => c.id === id)
      if (index >= 0) {
        this.setData({
          activeCategory: id,
          activeIndex: index,
          activeTools: ALL_CATEGORIES[index].tools,
        })
      }
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