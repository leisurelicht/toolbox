// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
  },
})