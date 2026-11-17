interface Ornament {
  key: string
  symbol: string
  name: string
  en: string
  cat: string
  desc: string
}

const CATS = ['全部', '装饰音', '发音与力度', '反复与跳跃', '弓法与音区', '其他记号']

const RAW: Ornament[] = [
  /* ===== 装饰音 ===== */
  { key: 'o1', symbol: 'tr', name: '颤音', en: 'Trill', cat: '装饰音',
    desc: '主音与上方邻音快速交替，通常以短波音收尾；巴洛克时期常从上方邻音起' },
  { key: 'o2', symbol: '~', name: '波音', en: 'Mordent', cat: '装饰音',
    desc: '主音→上方邻音→主音为上波音；加竖线则为下波音（主音→下方邻音→主音）' },
  { key: 'o3', symbol: '∽', name: '回音', en: 'Turn', cat: '装饰音',
    desc: '上方邻音→主音→下方邻音→主音，共四个音，符号形似横放的 S' },
  { key: 'o4', symbol: 'app.', name: '倚音', en: 'Appoggiatura', cat: '装饰音',
    desc: '长倚音占主音时值的一半或三分之二；短倚音（碎音）极短，带斜线' },
  { key: 'o5', symbol: 'gliss.', name: '滑音', en: 'Glissando', cat: '装饰音',
    desc: '在两音之间连续滑过；声乐中称 Portamento，常以斜线或波浪线标示' },

  /* ===== 发音与力度 ===== */
  { key: 'a1', symbol: '·', name: '断奏', en: 'Staccato', cat: '发音与力度',
    desc: '音符上方或下方加圆点，奏得短促；两点为倍断，加竖线为极断' },
  { key: 'a2', symbol: '^', name: '重断', en: 'Marcato', cat: '发音与力度',
    desc: '倒 V 形记号，强而短，比普通重音更有力' },
  { key: 'a3', symbol: '>', name: '重音', en: 'Accent', cat: '发音与力度',
    desc: '单音加强，通常奏成音头突出、渐弱收尾' },
  { key: 'a4', symbol: '—', name: '保持', en: 'Tenuto', cat: '发音与力度',
    desc: '奏足时值并稍加重量，音与音之间略有连接' },
  { key: 'a5', symbol: '⌒', name: '圆滑线', en: 'Slur', cat: '发音与力度',
    desc: '覆盖的音连贯奏出，弦乐一弓、管乐一口气；与连音线（同音相连）不同' },
  { key: 'a6', symbol: '—·—', name: '连断奏', en: 'Portato', cat: '发音与力度',
    desc: '保持记号与断奏点并用，介于连奏与断奏之间' },
  { key: 'a7', symbol: 'sfz', name: '突强', en: 'Sforzando', cat: '发音与力度',
    desc: '在弱奏中突然加强某一音或和弦' },
  { key: 'a8', symbol: 'fp', name: '强后弱', en: 'Forte-piano', cat: '发音与力度',
    desc: '强奏后立即转弱，常用于古典时期作品的叹息式动机' },

  /* ===== 反复与跳跃 ===== */
  { key: 'r1', symbol: '||:  :||', name: '反复记号', en: 'Repeat', cat: '反复与跳跃',
    desc: '两点朝向的竖线标记重复段落；只出现右半时回到开头' },
  { key: 'r2', symbol: 'D.C.', name: '从头反复', en: 'Da capo', cat: '反复与跳跃',
    desc: '回到全曲开头；D.C. al Fine 表示反复至 Fine 结束' },
  { key: 'r3', symbol: 'D.S.', name: '从记号反复', en: 'Dal segno', cat: '反复与跳跃',
    desc: '回到 𝄋（Segno）记号处；D.S. al Coda 反复后跳至 Coda' },
  { key: 'r4', symbol: 'S', name: '记号', en: 'Segno', cat: '反复与跳跃',
    desc: '反复的起点标记，形似 S 加斜线与点' },
  { key: 'r5', symbol: 'Coda', name: '尾声', en: 'Coda', cat: '反复与跳跃',
    desc: '乐曲结尾的独立段落，常以十字圆圈记号标示' },
  { key: 'r6', symbol: 'Fine', name: '结束', en: 'Fine', cat: '反复与跳跃',
    desc: '与反复记号配合使用，表示全曲真正结束的位置' },
  { key: 'r7', symbol: '1. 2.', name: '一二房', en: 'First / Second ending', cat: '反复与跳跃',
    desc: '第一房演奏后反复回前面，再跳过第一房进入第二房' },
  { key: 'r8', symbol: 'Vi-de', name: '跳跃记号', en: 'Vi-de', cat: '反复与跳跃',
    desc: '省略段落的起止标记，表示跳过中间部分' },

  /* ===== 弓法与音区 ===== */
  { key: 'b1', symbol: 'V', name: '上弓', en: 'Up bow', cat: '弓法与音区',
    desc: '弦乐由弓尖向弓根方向运弓' },
  { key: 'b2', symbol: 'Π', name: '下弓', en: 'Down bow', cat: '弓法与音区',
    desc: '弦乐由弓根向弓尖方向运弓，强拍起常标记下弓' },
  { key: 'b3', symbol: '8va', name: '高八度', en: 'Ottava alta', cat: '弓法与音区',
    desc: '虚线以上方音区演奏，比记谱高八度；常省略高音区的加线' },
  { key: 'b4', symbol: '8vb', name: '低八度', en: 'Ottava bassa', cat: '弓法与音区',
    desc: '虚线以下方音区演奏，比记谱低八度' },
  { key: 'b5', symbol: '○', name: '泛音', en: 'Harmonics', cat: '弓法与音区',
    desc: '弦乐以菱形或圆圈记号标示自然泛音与人工泛音' },
  { key: 'b6', symbol: 'con sord.', name: '加弱音器', en: 'Con sordino', cat: '弓法与音区',
    desc: '弦乐加弱音器降低音量、柔化音色；Senza sord. 表示去掉' },

  /* ===== 其他记号 ===== */
  { key: 'm1', symbol: 'Ped.', name: '踩踏板', en: 'Pedal', cat: '其他记号',
    desc: '钢琴踩下延音踏板，星号或竖线表示换踏板或松开' },
  { key: 'm2', symbol: 'v', name: '换气', en: 'Breath mark', cat: '其他记号',
    desc: '管乐与声乐的换气位置，形似逗点或小 V' },
  { key: 'm3', symbol: 'ferm.', name: '延长记号', en: 'Fermata', cat: '其他记号',
    desc: '弧线加点的记号，表示超出时值的自由延长' },
  { key: 'm4', symbol: '♭♯', name: '提示性临时记号', en: 'Cautionary accidental', cat: '其他记号',
    desc: '放在括号内的临时记号，仅作提醒，不改变记谱时值' },
]

function pickTerms(cat: string): Ornament[] {
  if (cat === '全部') return RAW
  return RAW.filter((t) => t.cat === cat)
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
      const visible = pickTerms(cat)
      this.setData({ activeCat: cat, visible, count: visible.length })
    },
  },
})
