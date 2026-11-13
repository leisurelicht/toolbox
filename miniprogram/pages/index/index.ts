interface Tool {
  id: string
  name: string
  symbol: string
  description: string
  iconBg: string
  iconColor: string
  borderColor: string
  comingSoon: boolean
}

Component({
  data: {
    tools: [
      {
        id: 'counter',
        name: '计数器',
        symbol: '计',
        description: '点击计数，轻松统计',
        iconBg: '#EEF2FF',
        iconColor: '#4C6EF5',
        borderColor: '#DBE4FF',
        comingSoon: true,
      },
      {
        id: 'random',
        name: '随机数',
        symbol: '?',
        description: '随机生成，趣味抽签',
        iconBg: '#FFF0E6',
        iconColor: '#F76707',
        borderColor: '#FFE8CC',
        comingSoon: true,
      },
    ] as Tool[],
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 0 })
      }
    },
  },

  methods: {
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
    },
  },
})