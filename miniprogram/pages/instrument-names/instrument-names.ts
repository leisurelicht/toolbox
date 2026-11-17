interface Instrument {
  key: string
  zh: string
  abbr: string
  family: string
  it: string
  de: string
  fr: string
  en: string
}

const CATS = ['全部', '弦乐', '木管', '铜管', '打击乐', '键盘与人声']

const RAW: Instrument[] = [
  /* ===== 弦乐 ===== */
  { key: 's1', zh: '小提琴', abbr: 'Vl.', family: '弦乐', it: 'Violino', de: 'Violine', fr: 'Violon', en: 'Violin' },
  { key: 's2', zh: '中提琴', abbr: 'Vla.', family: '弦乐', it: 'Viola', de: 'Bratsche', fr: 'Alto', en: 'Viola' },
  { key: 's3', zh: '大提琴', abbr: 'Vc.', family: '弦乐', it: 'Violoncello', de: 'Violoncello', fr: 'Violoncelle', en: 'Cello' },
  { key: 's4', zh: '低音提琴', abbr: 'Cb.', family: '弦乐', it: 'Contrabbasso', de: 'Kontrabass', fr: 'Contrebasse', en: 'Double bass' },
  { key: 's5', zh: '竖琴', abbr: 'Arp.', family: '弦乐', it: 'Arpa', de: 'Harfe', fr: 'Harpe', en: 'Harp' },

  /* ===== 木管 ===== */
  { key: 'w1', zh: '长笛', abbr: 'Fl.', family: '木管', it: 'Flauto', de: 'Flöte', fr: 'Flûte', en: 'Flute' },
  { key: 'w2', zh: '短笛', abbr: 'Picc.', family: '木管', it: 'Ottavino', de: 'Piccoloflöte', fr: 'Petite flûte', en: 'Piccolo' },
  { key: 'w3', zh: '双簧管', abbr: 'Ob.', family: '木管', it: 'Oboe', de: 'Oboe', fr: 'Hautbois', en: 'Oboe' },
  { key: 'w4', zh: '单簧管', abbr: 'Cl.', family: '木管', it: 'Clarinetto', de: 'Klarinette', fr: 'Clarinette', en: 'Clarinet' },
  { key: 'w5', zh: '巴松', abbr: 'Fg.', family: '木管', it: 'Fagotto', de: 'Fagott', fr: 'Basson', en: 'Bassoon' },
  { key: 'w6', zh: '萨克斯', abbr: 'Sax.', family: '木管', it: 'Sassofono', de: 'Saxophon', fr: 'Saxophone', en: 'Saxophone' },

  /* ===== 铜管 ===== */
  { key: 'b1', zh: '圆号', abbr: 'Cor.', family: '铜管', it: 'Corno', de: 'Horn', fr: 'Cor', en: 'Horn' },
  { key: 'b2', zh: '小号', abbr: 'Tr.', family: '铜管', it: 'Tromba', de: 'Trompete', fr: 'Trompette', en: 'Trumpet' },
  { key: 'b3', zh: '长号', abbr: 'Trb.', family: '铜管', it: 'Trombone', de: 'Posaune', fr: 'Trombone', en: 'Trombone' },
  { key: 'b4', zh: '大号', abbr: 'Tb.', family: '铜管', it: 'Tuba', de: 'Tuba', fr: 'Tuba', en: 'Tuba' },

  /* ===== 打击乐 ===== */
  { key: 'p1', zh: '定音鼓', abbr: 'Timp.', family: '打击乐', it: 'Timpani', de: 'Pauken', fr: 'Timbales', en: 'Timpani' },
  { key: 'p2', zh: '小鼓', abbr: 'Tamb.', family: '打击乐', it: 'Tamburo', de: 'Kleine Trommel', fr: 'Caisse claire', en: 'Snare drum' },
  { key: 'p3', zh: '三角铁', abbr: 'Tri.', family: '打击乐', it: 'Triangolo', de: 'Triangel', fr: 'Triangle', en: 'Triangle' },
  { key: 'p4', zh: '钹', abbr: 'Cym.', family: '打击乐', it: 'Piatti', de: 'Becken', fr: 'Cymbales', en: 'Cymbals' },
  { key: 'p5', zh: '木琴', abbr: 'Xil.', family: '打击乐', it: 'Xilofono', de: 'Xylophon', fr: 'Xylophone', en: 'Xylophone' },

  /* ===== 键盘与人声 ===== */
  { key: 'k1', zh: '钢琴', abbr: 'Pf.', family: '键盘与人声', it: 'Pianoforte', de: 'Klavier', fr: 'Piano', en: 'Piano' },
  { key: 'k2', zh: '管风琴', abbr: 'Org.', family: '键盘与人声', it: 'Organo', de: 'Orgel', fr: 'Orgue', en: 'Organ' },
  { key: 'k3', zh: '大键琴', abbr: 'Cemb.', family: '键盘与人声', it: 'Clavicembalo', de: 'Cembalo', fr: 'Clavecin', en: 'Harpsichord' },
  { key: 'k4', zh: '女高音', abbr: 'S.', family: '键盘与人声', it: 'Soprano', de: 'Sopran', fr: 'Soprano', en: 'Soprano' },
  { key: 'k5', zh: '男高音', abbr: 'T.', family: '键盘与人声', it: 'Tenore', de: 'Tenor', fr: 'Ténor', en: 'Tenor' },
  { key: 'k6', zh: '混声合唱', abbr: 'Coro', family: '键盘与人声', it: 'Coro misto', de: 'Gemischter Chor', fr: 'Chœur mixte', en: 'Mixed chorus' },
]

function pickList(cat: string): Instrument[] {
  if (cat === '全部') return RAW
  return RAW.filter((i) => i.family === cat)
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
    cats: CATS,
    activeCat: '全部',
    visible: RAW,
    count: RAW.length,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onCat(e: WechatMiniprogram.TouchEvent) {
      const cat = e.currentTarget.dataset.cat as string
      const visible = pickList(cat)
      this.setData({ activeCat: cat, visible, count: visible.length })
    },
  },
})