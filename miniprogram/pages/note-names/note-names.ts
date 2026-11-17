interface NoteNameEntry {
  english: string
  german: string
  french: string
  italian: string
  chineseLetter: string
  chineseSolfege: string
  midiBase: number
  color: string
}

const NATURAL_NOTES: NoteNameEntry[] = [
  { english: 'C', german: 'C',     french: 'Ut / Do',  italian: 'Do',   chineseLetter: 'C', chineseSolfege: 'do',    midiBase: 0,  color: '#FFF' },
  { english: 'D', german: 'D',     french: 'Ré',       italian: 'Re',   chineseLetter: 'D', chineseSolfege: 're',    midiBase: 2,  color: '#FFF' },
  { english: 'E', german: 'E',     french: 'Mi',       italian: 'Mi',   chineseLetter: 'E', chineseSolfege: 'mi',    midiBase: 4,  color: '#FFF' },
  { english: 'F', german: 'F',     french: 'Fa',       italian: 'Fa',   chineseLetter: 'F', chineseSolfege: 'fa',    midiBase: 5,  color: '#FFF' },
  { english: 'G', german: 'G',     french: 'Sol',      italian: 'Sol',  chineseLetter: 'G', chineseSolfege: 'sol',   midiBase: 7,  color: '#FFF' },
  { english: 'A', german: 'A',     french: 'La',       italian: 'La',   chineseLetter: 'A', chineseSolfege: 'la',    midiBase: 9,  color: '#FFF' },
  { english: 'B', german: 'H',     french: 'Si',       italian: 'Si',   chineseLetter: 'B', chineseSolfege: 'si/ti', midiBase: 11, color: '#FFF' },
]

interface AccidentalInfo {
  symbol: string
  zh: string
  en: string
  deSuffix: string
  frWord: string
  itWord: string
}

const ACCIDENTALS: AccidentalInfo[] = [
  { symbol: '♮', zh: '还原',    en: 'natural',        deSuffix: '',      frWord: 'bécarre',     itWord: 'bequadro' },
  { symbol: '♯', zh: '升',      en: 'sharp',          deSuffix: '-is',   frWord: 'dièse',       itWord: 'diesis' },
  { symbol: '♭', zh: '降',      en: 'flat',           deSuffix: '-es',   frWord: 'bémol',       itWord: 'bemolle' },
  { symbol: '𝄪', zh: '重升',    en: 'double sharp',   deSuffix: '-isis', frWord: 'double dièse', itWord: 'doppio diesis' },
  { symbol: '𝄫', zh: '重降',    en: 'double flat',    deSuffix: '-eses', frWord: 'double bémol', itWord: 'doppio bemolle' },
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
    naturalNotes: NATURAL_NOTES,
    accidentals: ACCIDENTALS,
    columns: [
      { key: 'english',       label: 'English' },
      { key: 'german',        label: 'Deutsch' },
      { key: 'french',        label: 'Français' },
      { key: 'italian',       label: 'Italiano' },
      { key: 'chineseLetter', label: '音名' },
      { key: 'chineseSolfege', label: '唱名' },
    ],
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
