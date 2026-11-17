/* ===== 类型 ===== */
interface QuickTool {
  id: string
  name: string
  desc: string
  symbol: string
  iconBg: string
  iconColor: string
  path: string
}

interface Tip {
  no: string
  text: string
}

/* ===== 常用入口（与首页工具目录保持一致） ===== */
const QUICK_TOOLS: QuickTool[] = [
  {
    id: 'counter',
    name: '计数器',
    desc: '随手计数',
    symbol: '计',
    iconBg: '#EEF2FF',
    iconColor: '#4C6EF5',
    path: '/pages/counter/counter',
  },
  {
    id: 'date-calc',
    name: '日期计算',
    desc: '倒数与推算',
    symbol: '日',
    iconBg: '#E0F2FE',
    iconColor: '#0369A1',
    path: '/pages/date-calc/date-calc',
  },
  {
    id: 'key-signature',
    name: '调号速查',
    desc: '15 个大小调',
    symbol: '♯',
    iconBg: '#FFF0E6',
    iconColor: '#E87A2A',
    path: '/pages/key-signature/key-signature',
  },
  {
    id: 'metronome',
    name: '节拍器',
    desc: '稳定节拍',
    symbol: '节',
    iconBg: '#FFEBEE',
    iconColor: '#D32F2F',
    path: '/pages/metronome/metronome',
  },
]

/* ===== 使用小贴士 ===== */
const TIPS: Tip[] = [
  { no: '01', text: '首页顶部可切换「音乐 / 日常」，音乐分类还支持二级筛选。' },
  { no: '02', text: '常用设置与记录保存在本机，无需登录，也不会上传。' },
  { no: '03', text: '觉得好用，点右上角「···」把工具箱推荐给朋友。' },
]

/* ===== 工具函数 ===== */
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
      /* 兜底估算：导航栏 44px + 状态栏 */
      const info = wx.getSystemInfoSync()
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0))
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    quickTools: QUICK_TOOLS as QuickTool[],
    tips: TIPS as Tip[],
    scrollHeight: 0,
    showAbout: false,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
    },
  },

  methods: {
    onShareAppMessage() {
      return {
        title: '工具箱 · 让每件小事更简单',
        path: '/pages/index/index',
      }
    },

    onShareTimeline() {
      return {
        title: '工具箱 · 让每件小事更简单',
      }
    },

    onQuickTap(e: WechatMiniprogram.TouchEvent) {
      const path = e.currentTarget.dataset.path as string
      if (!path) return
      wx.navigateTo({ url: path })
    },

    onGoHome() {
      wx.switchTab({ url: '/pages/index/index' })
    },

    onTapAbout() {
      this.setData({ showAbout: true })
    },

    closeAbout() {
      this.setData({ showAbout: false })
    },

    noop() {},

    onTapFeedback() {
      wx.showModal({
        title: '意见反馈',
        content:
          '欢迎在小程序右上角「···」中选择「反馈与投诉」，你的建议会直接送达开发者。',
        showCancel: false,
        confirmText: '知道了',
      })
    },

    onClearCache() {
      wx.showModal({
        title: '清除缓存',
        content: '将清除行情缓存与调试日志，不会影响你的倒数日和历史记录。',
        confirmColor: '#F76707',
        success: (res) => {
          if (!res.confirm) return
          try {
            wx.removeStorageSync('fund_te_cache_v1')
            wx.removeStorageSync('logs')
          } catch (err) {
            console.error('清除缓存失败', err)
          }
          wx.showToast({
            title: '缓存已清除',
            icon: 'none',
            duration: 1200,
          })
        },
      })
    },
  },
})
