interface HistoryItem {
  delta: number
  time: number
  label: string
}

Component({
  data: {
    count: 0,
    step: 1,
    steps: [1, 5, 10, 50, 100],
    pulse: false,
    history: [] as HistoryItem[],
  },

  methods: {
    /* 大点击区 —— 主要计数交互 */
    onTapZone() {
      this.doCount(this.data.step)
      wx.vibrateShort({ type: 'light' })
    },

    /* 步长切换 */
    onStepChange(e: WechatMiniprogram.TouchEvent) {
      const step = Number(e.currentTarget.dataset.step)
      this.setData({ step })
    },

    /* 减少按钮 */
    onDecrement() {
      this.doCount(-this.data.step)
    },

    /* 增减核心逻辑 */
    doCount(delta: number) {
      const newCount = this.data.count + delta
      this.setData({ count: newCount, pulse: true })

      // 记录历史
      const now = Date.now()
      const d = new Date()
      const label = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      const item: HistoryItem = { delta, time: now, label }
      const history = [item, ...this.data.history].slice(0, 50) // 最多保留 50 条
      this.setData({ history })

      this.clearPulse()
    },

    /* 撤销 */
    onUndo() {
      if (this.data.history.length === 0) {
        wx.showToast({ title: '没有可撤销的操作', icon: 'none', duration: 1200 })
        return
      }
      const last = this.data.history[0]
      const newCount = this.data.count - last.delta
      const history = this.data.history.slice(1)
      this.setData({ count: newCount, history })
      wx.showToast({ title: '已撤销', icon: 'none', duration: 800 })
    },

    /* 归零 */
    onReset() {
      if (this.data.count === 0) return
      wx.showModal({
        title: '归零确认',
        content: '当前计数 ' + this.data.count + '，确定归零吗？',
        confirmText: '归零',
        confirmColor: '#F76707',
        success: (res) => {
          if (res.confirm) {
            this.setData({ count: 0, history: [] })
            wx.showToast({ title: '已归零', icon: 'none', duration: 800 })
          }
        },
      })
    },

    /* 清空历史 */
    onClearHistory() {
      wx.showModal({
        title: '清空确认',
        content: '确定清空所有记录吗？',
        confirmText: '清空',
        confirmColor: '#F76707',
        success: (res) => {
          if (res.confirm) {
            this.setData({ history: [] })
            wx.showToast({ title: '记录已清空', icon: 'none', duration: 800 })
          }
        },
      })
    },

    /* 脉冲动画 */
    clearPulse() {
      if (this._pulseTimer) clearTimeout(this._pulseTimer)
      this._pulseTimer = setTimeout(() => {
        this.setData({ pulse: false })
      }, 150)
    },
  },
})