interface NoteFreq {
  name: string
  midi: number
  hz440: string
  hz415: string
  hz430: string
  hz432: string
}

interface OctaveGroup {
  octave: number
  label: string
  notes: NoteFreq[]
  expanded: boolean
}

interface PitchStandard {
  value: string
  label: string
  refA4: number
  desc: string
}

const NOTE_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B']

function calcFreq(midi: number, a4Freq: number): number {
  return a4Freq * Math.pow(2, (midi - 69) / 12)
}

/** 预先格式化为字符串，WXML 内只能做取值与运算，不能调用方法 */
function fmt(midi: number, a4Freq: number): string {
  return calcFreq(midi, a4Freq).toFixed(2)
}

function buildOctaveGroups(): OctaveGroup[] {
  const groups: OctaveGroup[] = []
  for (let oct = 0; oct <= 8; oct++) {
    const notes: NoteFreq[] = []
    const baseMidi = oct * 12 + 12
    for (let n = 0; n < 12; n++) {
      const midi = baseMidi + n
      if (midi > 108) break // B8 = MIDI 108
      notes.push({
        name: NOTE_NAMES[n] + oct,
        midi,
        hz440: fmt(midi, 440),
        hz415: fmt(midi, 415),
        hz430: fmt(midi, 430),
        hz432: fmt(midi, 432),
      })
    }
    if (notes.length > 0) {
      groups.push({
        octave: oct,
        label: `第 ${oct} 八度`,
        notes,
        // 默认展开 3–5 八度（最常用音域）
        expanded: oct >= 3 && oct <= 5,
      })
    }
  }
  return groups
}

const PITCH_STANDARDS: PitchStandard[] = [
  { value: '440', label: 'A4 = 440 Hz', refA4: 440, desc: '现代国际标准' },
  { value: '415', label: 'A4 = 415 Hz', refA4: 415, desc: '巴洛克音高' },
  { value: '430', label: 'A4 = 430 Hz', refA4: 430, desc: '古典时期' },
  { value: '432', label: 'A4 = 432 Hz', refA4: 432, desc: 'Verdi 标准' },
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
      // 兜底估算：导航栏 44px + 状态栏 + 顶栏约 118rpx
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 118 * rpx)
    }
    if (h > 0) {
      inst.setData({ scrollHeight: h })
    }
  })
}

Component({
  data: {
    octaveGroups: buildOctaveGroups(),
    pitchStandards: PITCH_STANDARDS,
    activeStandard: '440',
    scrollHeight: 0,
  },

  lifetimes: {
    ready() {
      applyScrollHeight(this)
    },
  },

  methods: {
    onStandardChange(e: WechatMiniprogram.TouchEvent) {
      const value = e.currentTarget.dataset.value
      if (value && value !== this.data.activeStandard) {
        this.setData({ activeStandard: value })
      }
    },

    onToggleOctave(e: WechatMiniprogram.TouchEvent) {
      const octave = Number(e.currentTarget.dataset.octave)
      const groups = this.data.octaveGroups.map((g: OctaveGroup) => {
        if (g.octave === octave) {
          return { ...g, expanded: !g.expanded }
        }
        return g
      })
      this.setData({ octaveGroups: groups })
    },
  },
})