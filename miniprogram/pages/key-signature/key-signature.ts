interface KeySig {
  major: string
  minor: string
  sharps: number
  flats: number
  sharpNotes: string
  flatNotes: string
  zh: string
  de: string
  symbol: string
}

const ALL_KEYS: KeySig[] = [
  { major: 'C',  minor: 'Am',  sharps: 0, flats: 0, sharpNotes: '',                              flatNotes: '',                              zh: 'C大调 · a小调',       de: 'C-dur · a-moll',       symbol: '—' },
  { major: 'G',  minor: 'Em',  sharps: 1, flats: 0, sharpNotes: 'F♯',                            flatNotes: '',                              zh: 'G大调 · e小调',       de: 'G-dur · e-moll',       symbol: '♯' },
  { major: 'D',  minor: 'Bm',  sharps: 2, flats: 0, sharpNotes: 'F♯ C♯',                         flatNotes: '',                              zh: 'D大调 · b小调',       de: 'D-dur · h-moll',       symbol: '♯♯' },
  { major: 'A',  minor: 'F♯m', sharps: 3, flats: 0, sharpNotes: 'F♯ C♯ G♯',                      flatNotes: '',                              zh: 'A大调 · 升f小调',     de: 'A-dur · fis-moll',     symbol: '♯♯♯' },
  { major: 'E',  minor: 'C♯m', sharps: 4, flats: 0, sharpNotes: 'F♯ C♯ G♯ D♯',                   flatNotes: '',                              zh: 'E大调 · 升c小调',     de: 'E-dur · cis-moll',     symbol: '♯♯♯♯' },
  { major: 'B',  minor: 'G♯m', sharps: 5, flats: 0, sharpNotes: 'F♯ C♯ G♯ D♯ A♯',                flatNotes: '',                              zh: 'B大调 · 升g小调',     de: 'H-dur · gis-moll',     symbol: '♯♯♯♯♯' },
  { major: 'F♯', minor: 'D♯m', sharps: 6, flats: 0, sharpNotes: 'F♯ C♯ G♯ D♯ A♯ E♯',             flatNotes: '',                              zh: '升F大调 · 升d小调',   de: 'Fis-dur · dis-moll',   symbol: '♯♯♯♯♯♯' },
  { major: 'C♯', minor: 'A♯m', sharps: 7, flats: 0, sharpNotes: 'F♯ C♯ G♯ D♯ A♯ E♯ B♯',          flatNotes: '',                              zh: '升C大调 · 升a小调',   de: 'Cis-dur · ais-moll',   symbol: '♯♯♯♯♯♯♯' },
  { major: 'F',  minor: 'Dm',  sharps: 0, flats: 1, sharpNotes: '',                              flatNotes: 'B♭',                            zh: 'F大调 · d小调',       de: 'F-dur · d-moll',       symbol: '♭' },
  { major: 'B♭', minor: 'Gm',  sharps: 0, flats: 2, sharpNotes: '',                              flatNotes: 'B♭ E♭',                         zh: '降B大调 · g小调',     de: 'B-dur · g-moll',       symbol: '♭♭' },
  { major: 'E♭', minor: 'Cm',  sharps: 0, flats: 3, sharpNotes: '',                              flatNotes: 'B♭ E♭ A♭',                      zh: '降E大调 · c小调',     de: 'Es-dur · c-moll',      symbol: '♭♭♭' },
  { major: 'A♭', minor: 'Fm',  sharps: 0, flats: 4, sharpNotes: '',                              flatNotes: 'B♭ E♭ A♭ D♭',                   zh: '降A大调 · f小调',     de: 'As-dur · f-moll',      symbol: '♭♭♭♭' },
  { major: 'D♭', minor: 'B♭m', sharps: 0, flats: 5, sharpNotes: '',                              flatNotes: 'B♭ E♭ A♭ D♭ G♭',                zh: '降D大调 · 降b小调',   de: 'Des-dur · b-moll',     symbol: '♭♭♭♭♭' },
  { major: 'G♭', minor: 'E♭m', sharps: 0, flats: 6, sharpNotes: '',                              flatNotes: 'B♭ E♭ A♭ D♭ G♭ C♭',             zh: '降G大调 · 降e小调',   de: 'Ges-dur · es-moll',    symbol: '♭♭♭♭♭♭' },
  { major: 'C♭', minor: 'A♭m', sharps: 0, flats: 7, sharpNotes: '',                              flatNotes: 'B♭ E♭ A♭ D♭ G♭ C♭ F♭',          zh: '降C大调 · 降a小调',   de: 'Ces-dur · as-moll',    symbol: '♭♭♭♭♭♭♭' },
]

interface Mode {
  label: string
  value: 'major' | 'minor'
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
      // 兜底估算：导航栏 44px + 状态栏 + 顶栏约 116rpx
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 116 * rpx)
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    keys: ALL_KEYS as KeySig[],
    activeMode: 'major' as 'major' | 'minor',
    modes: [
      { label: '大调', value: 'major' },
      { label: '小调', value: 'minor' },
    ] as Mode[],
    scrollHeight: 0,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onModeChange(e: WechatMiniprogram.TouchEvent) {
      const { mode } = e.currentTarget.dataset
      this.setData({ activeMode: mode })
    },
  },
})