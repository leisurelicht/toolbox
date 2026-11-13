Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '工具箱',
        icon: '◇',
      },
      {
        pagePath: '/pages/mine/mine',
        text: '我的',
        icon: '○',
      },
    ],
  },

  methods: {
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { index, path } = e.currentTarget.dataset
      if (this.data.selected === index) return
      wx.switchTab({ url: path })
    },
  },
})