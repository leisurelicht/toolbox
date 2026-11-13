Component({
  data: {
    min: 1,
    max: 100,
    result: null as number | null,
    rolling: false,
    presets: [
      { label: '骰子', min: 1, max: 6 },
      { label: '1-10', min: 1, max: 10 },
      { label: '1-100', min: 1, max: 100 },
      { label: '硬币', min: 0, max: 1 },
    ],
  },

  methods: {
    /* ---- 范围输入 ---- */
    onMinInput(e: WechatMiniprogram.Input) {
      const val = parseInt(e.detail.value, 10)
      if (!isNaN(val)) {
        this.setData({ min: val })
      }
    },

    onMinBlur(e: WechatMiniprogram.Input) {
      let val = parseInt(e.detail.value, 10)
      if (isNaN(val) || val > this.data.max) {
        val = this.data.min // revert
      }
      this.setData({ min: val })
    },

    onMaxInput(e: WechatMiniprogram.Input) {
      const val = parseInt(e.detail.value, 10)
      if (!isNaN(val)) {
        this.setData({ max: val })
      }
    },

    onMaxBlur(e: WechatMiniprogram.Input) {
      let val = parseInt(e.detail.value, 10)
      if (isNaN(val) || val < this.data.min) {
        val = this.data.max
      }
      this.setData({ max: val })
    },

    onMinInc() {
      if (this.data.min < this.data.max) {
        this.setData({ min: this.data.min + 1 })
      }
    },

    onMinDec() {
      this.setData({ min: this.data.min - 1 })
    },

    onMaxInc() {
      this.setData({ max: this.data.max + 1 })
    },

    onMaxDec() {
      if (this.data.max > this.data.min) {
        this.setData({ max: this.data.max - 1 })
      }
    },

    /* ---- 快捷预设 ---- */
    onPreset(e: WechatMiniprogram.TouchEvent) {
      const { min, max } = e.currentTarget.dataset as { min: number; max: number }
      this.setData({ min, max })
    },

    /* ---- 生成 ---- */
    onGenerate() {
      const { min, max } = this.data
      if (min >= max) {
        wx.showToast({ title: '最小值需小于最大值', icon: 'none', duration: 1500 })
        return
      }

      // 滚动动画
      this.setData({ rolling: true })
      const duration = 400
      const interval = 40
      const steps = Math.floor(duration / interval)
      let step = 0

      const timer = setInterval(() => {
        const fake = min + Math.floor(Math.random() * (max - min + 1))
        this.setData({ result: fake })
        step++
        if (step >= steps) {
          clearInterval(timer)
          // 最终结果
          const final = min + Math.floor(Math.random() * (max - min + 1))
          this.setData({ result: final, rolling: false })
        }
      }, interval)

      // 触觉反馈
      wx.vibrateShort({ type: 'light' })
    },
  },
})