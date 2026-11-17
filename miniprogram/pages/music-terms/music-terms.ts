interface RawTerm {
  term: string
  lang: string
  zh: string
  cat: string
}

interface Term extends RawTerm {
  key: string
}

const CATS = ['全部', '速度', '表情', '力度', '演奏法', '体裁']

/* ===== 速度 ===== */
const TEMPO: RawTerm[] = [
  { term: 'Adagio', lang: '意', zh: '柔板，缓慢而从容', cat: '速度' },
  { term: 'Adagissimo', lang: '意', zh: '极缓慢', cat: '速度' },
  { term: 'Largo', lang: '意', zh: '广板，宽广而缓慢', cat: '速度' },
  { term: 'Larghetto', lang: '意', zh: '小广板，比广板稍快', cat: '速度' },
  { term: 'Lento', lang: '意', zh: '慢板', cat: '速度' },
  { term: 'Andante', lang: '意', zh: '行板，近似步行的速度', cat: '速度' },
  { term: 'Andantino', lang: '意', zh: '小行板，比行板稍快', cat: '速度' },
  { term: 'Moderato', lang: '意', zh: '中板，中等速度', cat: '速度' },
  { term: 'Allegretto', lang: '意', zh: '小快板', cat: '速度' },
  { term: 'Allegro', lang: '意', zh: '快板', cat: '速度' },
  { term: 'Vivace', lang: '意', zh: '活泼地，快速', cat: '速度' },
  { term: 'Presto', lang: '意', zh: '急板', cat: '速度' },
  { term: 'Prestissimo', lang: '意', zh: '最急板', cat: '速度' },
  { term: 'Tempo giusto', lang: '意', zh: '恰当而准确的速度', cat: '速度' },
  { term: 'Rubato', lang: '意', zh: '弹性速度，自由伸缩', cat: '速度' },
  { term: 'Accelerando (accel.)', lang: '意', zh: '渐快', cat: '速度' },
  { term: 'Ritardando (rit.)', lang: '意', zh: '渐慢', cat: '速度' },
  { term: 'Rallentando (rall.)', lang: '意', zh: '逐渐减慢', cat: '速度' },
  { term: 'Ritenuto (riten.)', lang: '意', zh: '突慢并保持较慢速度', cat: '速度' },
  { term: 'Meno mosso', lang: '意', zh: '速度稍慢一些', cat: '速度' },
  { term: 'Più mosso', lang: '意', zh: '速度稍快一些', cat: '速度' },
  { term: 'A tempo', lang: '意', zh: '恢复原速', cat: '速度' },
  { term: 'Tempo primo', lang: '意', zh: '回到最初的速度', cat: '速度' },
  { term: 'Alla breve', lang: '意', zh: '以二分音符为一拍（cut time）', cat: '速度' },
  { term: 'L\u2019istesso tempo', lang: '意', zh: '同速，拍号改变但速度不变', cat: '速度' },
  { term: 'Ad libitum', lang: '意', zh: '速度自由处理', cat: '速度' },
  { term: 'mässig', lang: '德', zh: '中等的（速度）', cat: '速度' },
  { term: 'langsam', lang: '德', zh: '缓慢地', cat: '速度' },
  { term: 'schnell', lang: '德', zh: '快速地', cat: '速度' },
  { term: 'zurückhaltend', lang: '德', zh: '抑制地，渐慢', cat: '速度' },
  { term: 'nicht zu schnell', lang: '德', zh: '速度不要太快', cat: '速度' },
  { term: 'lent', lang: '法', zh: '缓慢地', cat: '速度' },
  { term: 'modéré', lang: '法', zh: '中等的速度', cat: '速度' },
  { term: 'vif', lang: '法', zh: '活泼快速', cat: '速度' },
  { term: 'retenu', lang: '法', zh: '放慢', cat: '速度' },
  { term: 'cédé', lang: '法', zh: '放宽、渐慢', cat: '速度' },
]

/* ===== 表情 ===== */
const EXPRESSION: RawTerm[] = [
  { term: 'Dolce', lang: '意', zh: '柔和甜美地', cat: '表情' },
  { term: 'Dolcissimo', lang: '意', zh: '极其柔美地', cat: '表情' },
  { term: 'Espressivo', lang: '意', zh: '富有表情地', cat: '表情' },
  { term: 'Cantabile', lang: '意', zh: '如歌地', cat: '表情' },
  { term: 'Sostenuto', lang: '意', zh: '持续地，保持音', cat: '表情' },
  { term: 'Grazioso', lang: '意', zh: '优雅地', cat: '表情' },
  { term: 'Giocoso', lang: '意', zh: '诙谐欢快地', cat: '表情' },
  { term: 'Maestoso', lang: '意', zh: '庄严雄伟地', cat: '表情' },
  { term: 'Marziale', lang: '意', zh: '进行曲风格，威武地', cat: '表情' },
  { term: 'Misterioso', lang: '意', zh: '神秘地', cat: '表情' },
  { term: 'Scherzando', lang: '意', zh: '谐谑地', cat: '表情' },
  { term: 'Tranquillo', lang: '意', zh: '宁静地', cat: '表情' },
  { term: 'Appassionato', lang: '意', zh: '热情地', cat: '表情' },
  { term: 'Con brio', lang: '意', zh: '有活力、有生气地', cat: '表情' },
  { term: 'Con moto', lang: '意', zh: '有动感地，稍流动', cat: '表情' },
  { term: 'Con fuoco', lang: '意', zh: '火热地', cat: '表情' },
  { term: 'Con spirito', lang: '意', zh: '有精神地', cat: '表情' },
  { term: 'Affettuoso', lang: '意', zh: '深情地', cat: '表情' },
  { term: 'Agitato', lang: '意', zh: '激动不安地', cat: '表情' },
  { term: 'Animato', lang: '意', zh: '生气勃勃地', cat: '表情' },
  { term: 'Brillante', lang: '意', zh: '辉煌华丽地', cat: '表情' },
  { term: 'Comodo', lang: '意', zh: '舒适自在地', cat: '表情' },
  { term: 'Delicato', lang: '意', zh: '精致细腻地', cat: '表情' },
  { term: 'Feroce', lang: '意', zh: '猛烈地', cat: '表情' },
  { term: 'Lamentoso', lang: '意', zh: '哀伤地', cat: '表情' },
  { term: 'Mesto', lang: '意', zh: '忧郁地', cat: '表情' },
  { term: 'Nobilmente', lang: '意', zh: '高贵地', cat: '表情' },
  { term: 'Patetico', lang: '意', zh: '悲怆地', cat: '表情' },
  { term: 'Risoluto', lang: '意', zh: '果断坚定地', cat: '表情' },
  { term: 'Semplice', lang: '意', zh: '朴素地', cat: '表情' },
  { term: 'Serioso', lang: '意', zh: '严肃地', cat: '表情' },
  { term: 'Teneramente', lang: '意', zh: '温柔地', cat: '表情' },
  { term: 'Buffo', lang: '意', zh: '滑稽地', cat: '表情' },
  { term: 'Pastorale', lang: '意', zh: '田园风地', cat: '表情' },
  { term: 'Religioso', lang: '意', zh: '虔诚、宗教地', cat: '表情' },
  { term: 'Sognando', lang: '意', zh: '如梦似幻地', cat: '表情' },
  { term: 'Amabile', lang: '意', zh: '亲切可爱地', cat: '表情' },
  { term: 'Grandioso', lang: '意', zh: '宏伟壮丽地', cat: '表情' },
  { term: 'Malinconico', lang: '意', zh: '忧郁感伤地', cat: '表情' },
  { term: 'Strepitoso', lang: '意', zh: '喧闹嘈杂地', cat: '表情' },
  { term: 'Sotto voce', lang: '意', zh: '压低音量、轻声地', cat: '表情' },
  { term: 'lebhaft', lang: '德', zh: '活泼地', cat: '表情' },
  { term: 'ruhig', lang: '德', zh: '安静地', cat: '表情' },
  { term: 'zart', lang: '德', zh: '柔美纤弱地', cat: '表情' },
  { term: 'kräftig', lang: '德', zh: '有力地', cat: '表情' },
  { term: 'mit Ausdruck', lang: '德', zh: '富有表情地', cat: '表情' },
  { term: 'bewegt', lang: '德', zh: '激动地、流动地', cat: '表情' },
  { term: 'getragen', lang: '德', zh: '庄重舒缓地', cat: '表情' },
  { term: 'heiter', lang: '德', zh: '欢快地', cat: '表情' },
  { term: 'traurig', lang: '德', zh: '悲伤地', cat: '表情' },
  { term: 'drängend', lang: '德', zh: '催促地、赶着地', cat: '表情' },
  { term: 'doux', lang: '法', zh: '柔和地', cat: '表情' },
  { term: 'animé', lang: '法', zh: '活跃地', cat: '表情' },
  { term: 'grave', lang: '法', zh: '庄重地', cat: '表情' },
  { term: 'mouvementé', lang: '法', zh: '激动地', cat: '表情' },
  { term: 'soutenu', lang: '法', zh: '持续地', cat: '表情' },
]

/* ===== 力度 ===== */
const DYNAMICS: RawTerm[] = [
  { term: 'Pianissimo (pp)', lang: '意', zh: '极弱', cat: '力度' },
  { term: 'Piano (p)', lang: '意', zh: '弱', cat: '力度' },
  { term: 'Mezzo-piano (mp)', lang: '意', zh: '中弱', cat: '力度' },
  { term: 'Mezzo-forte (mf)', lang: '意', zh: '中强', cat: '力度' },
  { term: 'Forte (f)', lang: '意', zh: '强', cat: '力度' },
  { term: 'Fortissimo (ff)', lang: '意', zh: '极强', cat: '力度' },
  { term: 'Crescendo', lang: '意', zh: '渐强', cat: '力度' },
  { term: 'Decrescendo', lang: '意', zh: '渐弱', cat: '力度' },
  { term: 'Diminuendo', lang: '意', zh: '渐弱', cat: '力度' },
  { term: 'Sforzando (sfz)', lang: '意', zh: '突强', cat: '力度' },
  { term: 'Rinforzando (rf)', lang: '意', zh: '加强', cat: '力度' },
  { term: 'Smorzando', lang: '意', zh: '渐弱并消失', cat: '力度' },
  { term: 'Calando', lang: '意', zh: '渐弱且渐慢', cat: '力度' },
  { term: 'Morendo', lang: '意', zh: '逐渐消逝', cat: '力度' },
  { term: 'Perdendosi', lang: '意', zh: '渐渐消失', cat: '力度' },
  { term: 'Con tutta forza', lang: '意', zh: '用尽全力', cat: '力度' },
  { term: 'Forte-piano (fp)', lang: '意', zh: '先强后弱', cat: '力度' },
  { term: 'Mezza voce', lang: '意', zh: '半音量', cat: '力度' },
]

/* ===== 演奏法 ===== */
const TECHNIQUE: RawTerm[] = [
  { term: 'Staccato', lang: '意', zh: '断奏', cat: '演奏法' },
  { term: 'Staccatissimo', lang: '意', zh: '极短断奏', cat: '演奏法' },
  { term: 'Marcato', lang: '意', zh: '加重强调', cat: '演奏法' },
  { term: 'Tenuto', lang: '意', zh: '保持充分时值', cat: '演奏法' },
  { term: 'Accento', lang: '意', zh: '重音', cat: '演奏法' },
  { term: 'Portato', lang: '意', zh: '半连半断（连断奏）', cat: '演奏法' },
  { term: 'Legato', lang: '意', zh: '连奏，圆滑地', cat: '演奏法' },
  { term: 'Leggiero', lang: '意', zh: '轻巧地', cat: '演奏法' },
  { term: 'Glissando', lang: '意', zh: '滑奏', cat: '演奏法' },
  { term: 'Tremolo', lang: '意', zh: '震音', cat: '演奏法' },
  { term: 'Trillo', lang: '意', zh: '颤音', cat: '演奏法' },
  { term: 'Mordente', lang: '意', zh: '波音（下波音）', cat: '演奏法' },
  { term: 'Gruppetto', lang: '意', zh: '回音', cat: '演奏法' },
  { term: 'Arco', lang: '意', zh: '用弓演奏', cat: '演奏法' },
  { term: 'Pizzicato', lang: '意', zh: '拨奏', cat: '演奏法' },
  { term: 'Con sordino', lang: '意', zh: '加弱音器', cat: '演奏法' },
  { term: 'Senza sordino', lang: '意', zh: '去掉弱音器', cat: '演奏法' },
  { term: 'Sul ponticello', lang: '意', zh: '靠近琴码演奏', cat: '演奏法' },
  { term: 'Sul tasto', lang: '意', zh: '靠近指板演奏', cat: '演奏法' },
  { term: 'Flautando', lang: '意', zh: '笛声般的音色（弓靠指板）', cat: '演奏法' },
  { term: 'Col legno', lang: '意', zh: '用弓杆击弦', cat: '演奏法' },
  { term: 'Armonici', lang: '意', zh: '泛音', cat: '演奏法' },
  { term: 'Fermata', lang: '意', zh: '延长记号', cat: '演奏法' },
  { term: 'Cadenza', lang: '意', zh: '华彩乐段', cat: '演奏法' },
  { term: 'Vibrato', lang: '意', zh: '揉弦、颤吟', cat: '演奏法' },
  { term: 'Ossia', lang: '意', zh: '或为，替代演奏谱', cat: '演奏法' },
  { term: 'Tutti', lang: '意', zh: '全奏', cat: '演奏法' },
  { term: 'Solo', lang: '意', zh: '独奏', cat: '演奏法' },
  { term: 'Divisi', lang: '意', zh: '分部演奏', cat: '演奏法' },
  { term: 'Unisono', lang: '意', zh: '齐奏、同度', cat: '演奏法' },
  { term: 'Attacca', lang: '意', zh: '紧接下一段演奏', cat: '演奏法' },
  { term: 'Da capo (D.C.)', lang: '意', zh: '从头反复', cat: '演奏法' },
  { term: 'Dal segno (D.S.)', lang: '意', zh: '从记号处反复', cat: '演奏法' },
  { term: 'Coda', lang: '意', zh: '尾声', cat: '演奏法' },
  { term: 'Fine', lang: '意', zh: '结束', cat: '演奏法' },
  { term: 'Hauptstimme (H.)', lang: '德', zh: '主旋律', cat: '演奏法' },
  { term: 'Nebenstimme (N.)', lang: '德', zh: '副旋律', cat: '演奏法' },
  { term: 'en dehors', lang: '法', zh: '旋律突出（外声部）', cat: '演奏法' },
  { term: 'léger', lang: '法', zh: '轻巧地', cat: '演奏法' },
]

/* ===== 体裁 ===== */
const GENRE: RawTerm[] = [
  { term: 'Sonata', lang: '意', zh: '奏鸣曲', cat: '体裁' },
  { term: 'Sonatina', lang: '意', zh: '小奏鸣曲', cat: '体裁' },
  { term: 'Sinfonia', lang: '意', zh: '交响曲', cat: '体裁' },
  { term: 'Concerto', lang: '意', zh: '协奏曲', cat: '体裁' },
  { term: 'Fuga', lang: '意', zh: '赋格', cat: '体裁' },
  { term: 'Canone', lang: '意', zh: '卡农', cat: '体裁' },
  { term: 'Aria', lang: '意', zh: '咏叹调', cat: '体裁' },
  { term: 'Recitativo', lang: '意', zh: '宣叙调', cat: '体裁' },
  { term: 'Ouverture', lang: '意', zh: '序曲', cat: '体裁' },
  { term: 'Preludio', lang: '意', zh: '前奏曲', cat: '体裁' },
  { term: 'Studio (Étude)', lang: '意', zh: '练习曲', cat: '体裁' },
  { term: 'Notturno (Nocturne)', lang: '意', zh: '夜曲', cat: '体裁' },
  { term: 'Ballata', lang: '意', zh: '叙事曲', cat: '体裁' },
  { term: 'Rondò', lang: '意', zh: '回旋曲', cat: '体裁' },
  { term: 'Minuetto', lang: '意', zh: '小步舞曲', cat: '体裁' },
  { term: 'Scherzo', lang: '意', zh: '谐谑曲', cat: '体裁' },
  { term: 'Variazione', lang: '意', zh: '变奏曲', cat: '体裁' },
  { term: 'Fantasia', lang: '意', zh: '幻想曲', cat: '体裁' },
  { term: 'Toccata', lang: '意', zh: '托卡塔', cat: '体裁' },
  { term: 'Marcia', lang: '意', zh: '进行曲', cat: '体裁' },
  { term: 'Valzer', lang: '意', zh: '圆舞曲', cat: '体裁' },
  { term: 'Passacaglia', lang: '意', zh: '帕萨卡利亚', cat: '体裁' },
  { term: 'Ciaccona', lang: '意', zh: '恰空', cat: '体裁' },
  { term: 'Ricercar', lang: '意', zh: '里切尔卡', cat: '体裁' },
  { term: 'Oratorio', lang: '意', zh: '清唱剧', cat: '体裁' },
  { term: 'Cantata', lang: '意', zh: '康塔塔', cat: '体裁' },
  { term: 'Messa', lang: '意', zh: '弥撒曲', cat: '体裁' },
  { term: 'Mottetto', lang: '意', zh: '经文歌', cat: '体裁' },
  { term: 'Madrigale', lang: '意', zh: '牧歌', cat: '体裁' },
  { term: 'Intermezzo', lang: '意', zh: '间奏曲', cat: '体裁' },
  { term: 'Rapsodia', lang: '意', zh: '狂想曲', cat: '体裁' },
  { term: 'Lied', lang: '德', zh: '艺术歌曲', cat: '体裁' },
  { term: 'durchkomponiert', lang: '德', zh: '通谱体', cat: '体裁' },
  { term: 'impromptu', lang: '法', zh: '即兴曲', cat: '体裁' },
  { term: 'Suite', lang: '法', zh: '组曲', cat: '体裁' },
]

const RAW_TERMS: RawTerm[] = [
  ...TEMPO,
  ...EXPRESSION,
  ...DYNAMICS,
  ...TECHNIQUE,
  ...GENRE,
]

const TERMS: Term[] = RAW_TERMS.map((t, i) => {
  return {
    term: t.term,
    lang: t.lang,
    zh: t.zh,
    cat: t.cat,
    key: 't' + i,
  }
})

function pickTerms(cat: string, keyword: string): Term[] {
  const k = keyword.trim().toLowerCase()
  return TERMS.filter((t) => {
    if (cat !== '全部' && t.cat !== cat) return false
    if (!k) return true
    return t.term.toLowerCase().indexOf(k) >= 0 || t.zh.indexOf(k) >= 0
  })
}

const INIT_CAT = '全部'

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
    cats: CATS,
    activeCat: INIT_CAT,
    keyword: '',
    visible: TERMS,
    count: TERMS.length,
  },

  methods: {
    onCat(e: WechatMiniprogram.TouchEvent) {
      const cat = e.currentTarget.dataset.cat as string
      const visible = pickTerms(cat, this.data.keyword)
      this.setData({ activeCat: cat, visible, count: visible.length })
    },

    onInput(e: WechatMiniprogram.Input) {
      const keyword = e.detail.value
      const visible = pickTerms(this.data.activeCat, keyword)
      this.setData({ keyword, visible, count: visible.length })
    },

    onClear() {
      const visible = pickTerms(this.data.activeCat, '')
      this.setData({ keyword: '', visible, count: visible.length })
    },
  },
  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },
})
