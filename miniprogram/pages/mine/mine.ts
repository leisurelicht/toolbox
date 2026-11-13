Component({
  data: {},

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
    },
  },

  methods: {
    onTapAbout() {
      wx.showModal({
        title: '关于工具箱',
        content: '一款实用工具合集小程序\n版本: 1.0.0\n工具持续添加中…',
        showCancel: false,
      })
    },

    onTapFeedback() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none',
        duration: 1500,
      })
    },
  },
})