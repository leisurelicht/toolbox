interface Clef {
  id: string
  name: string
  shortName: string
  centerC: string
  lines: string[]
  spaces: string[]
  instruments: string
  desc: string
}

const CLEFS: Clef[] = [
  {
    id: 'treble',
    name: '高音谱号',
    shortName: 'G 谱号',
    centerC: '下加一线',
    lines: ['E4', 'G4', 'B4', 'D5', 'F5'],
    spaces: ['F4', 'A4', 'C5', 'E5'],
    instruments: '小提琴、长笛、双簧管、单簧管、钢琴右手',
    desc: 'G 谱号，卷曲中心落在第二线（G4）',
  },
  {
    id: 'bass',
    name: '低音谱号',
    shortName: 'F 谱号',
    centerC: '上加一线',
    lines: ['G2', 'B2', 'D3', 'F3', 'A3'],
    spaces: ['A2', 'C3', 'E3', 'G3'],
    instruments: '大提琴、低音提琴、巴松、长号、钢琴左手',
    desc: 'F 谱号，两个点夹住第四线（F3）',
  },
  {
    id: 'alto',
    name: '中音谱号',
    shortName: 'C 谱号（三线）',
    centerC: '第三线',
    lines: ['F3', 'A3', 'C4', 'E4', 'G4'],
    spaces: ['G3', 'B3', 'D4', 'F4'],
    instruments: '中提琴',
    desc: 'C 谱号，中心落在第三线（C4）',
  },
  {
    id: 'tenor',
    name: '次中音谱号',
    shortName: 'C 谱号（四线）',
    centerC: '第四线',
    lines: ['D3', 'F3', 'A3', 'C4', 'E4'],
    spaces: ['E3', 'G3', 'B3', 'D4'],
    instruments: '大提琴高音区、巴松高音区、次中音长号',
    desc: 'C 谱号，中心落在第四线（C4）',
  },
]

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
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 40)
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    scrollHeight: 0,
    clefs: CLEFS,
    activeIndex: 0,
    current: CLEFS[0],
  },

  methods: {
    onSelect(e: WechatMiniprogram.TouchEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const clef = CLEFS[index]
      if (!clef) return
      this.setData({ activeIndex: index, current: clef })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
