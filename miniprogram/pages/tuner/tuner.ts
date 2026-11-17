const SAMPLE_RATE = 44100
const DOWNSAMPLE = 4
const UI_INTERVAL = 120

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

let recorder: any = null
let running = false
let instRef: any = null
let lastUiAt = 0

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/**
 * 单帧 PCM → 音高（自相关法）
 * 返回 null 表示本帧能量过低或无法识别
 */
function detectFrequency(pcm: Int16Array): number | null {
  const n = Math.floor(pcm.length / DOWNSAMPLE)
  if (n < 256) return null

  const buf: number[] = []
  for (let i = 0; i < n; i++) {
    let sum = 0
    const base = i * DOWNSAMPLE
    for (let k = 0; k < DOWNSAMPLE; k++) {
      sum += pcm[base + k]
    }
    buf.push(sum / DOWNSAMPLE)
  }

  let energy = 0
  for (let i = 0; i < n; i++) {
    energy += buf[i] * buf[i]
  }
  const meanSq = energy / n
  if (meanSq < 22500) return null /* 等效 RMS < 150，判定为静音 */

  const sr = SAMPLE_RATE / DOWNSAMPLE
  const size = Math.min(n, 1024)
  const minLag = Math.max(2, Math.floor(sr / 1500))
  const maxLag = Math.min(size - 2, Math.floor(sr / 55))
  if (maxLag <= minLag) return null

  const corrs: number[] = []
  let bestLag = -1
  let bestCorr = 0
  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
    if (lag < 1 || lag >= size) {
      corrs.push(0)
      continue
    }
    let corr = 0
    const len = size - lag
    for (let i = 0; i < len; i++) {
      corr += buf[i] * buf[i + lag]
    }
    corr /= len
    corrs.push(corr)
    if (lag >= minLag && lag <= maxLag && corr > bestCorr) {
      bestCorr = corr
      bestLag = lag
    }
  }

  if (bestLag < 0 || bestCorr < meanSq * 0.45) return null

  /* 抛物线插值，把整数 lag 细化为小数，提升音分精度 */
  const idx = bestLag - (minLag - 1)
  const c0 = corrs[idx - 1] || 0
  const c1 = corrs[idx] || 0
  const c2 = corrs[idx + 1] || 0
  const denom = c0 - 2 * c1 + c2
  let delta = 0
  if (denom !== 0) {
    delta = (0.5 * (c0 - c2)) / denom
  }
  if (!isFinite(delta) || Math.abs(delta) > 1) delta = 0

  const refinedLag = bestLag + delta
  if (refinedLag <= 0) return null
  return sr / refinedLag
}

function buildUi(freq: number) {
  const midiFloat = 69 + 12 * Math.log2(freq / 440)
  if (!isFinite(midiFloat)) return null
  const midi = Math.round(midiFloat)
  if (midi < 12 || midi > 120) return null

  const cents = (midiFloat - midi) * 100
  const centsRounded = Math.round(cents * 10) / 10
  const octave = Math.floor(midi / 12) - 1
  const note = NOTE_NAMES[midi % 12] + octave
  const centsClass = centsRounded > 1 ? 'up' : centsRounded < -1 ? 'down' : 'zero'
  const hint = centsRounded > 1 ? '偏高' : centsRounded < -1 ? '偏低' : '准确'
  const centsText = centsRounded > 0 ? '+' + centsRounded.toFixed(1) : centsRounded.toFixed(1)

  return {
    note,
    hint,
    centsText,
    centsClass,
    freqText: freq.toFixed(2),
    barLeft: 50 + Math.max(-50, Math.min(50, cents)),
    standard: midiToFreq(midi).toFixed(2),
  }
}

function updateUi(freq: number | null) {
  if (!instRef) return
  const now = Date.now()
  if (now - lastUiAt < UI_INTERVAL) return
  lastUiAt = now

  if (freq === null) {
    instRef.setData({ statusText: '等待声音…' })
    return
  }
  const ui = buildUi(freq)
  if (!ui) {
    instRef.setData({ statusText: '超出识别范围' })
    return
  }
  instRef.setData({
    statusText: '正在识别',
    note: ui.note,
    hint: ui.hint,
    centsText: ui.centsText,
    centsClass: ui.centsClass,
    freqText: ui.freqText,
    barLeft: ui.barLeft,
    standard: ui.standard,
  })
}

function handleFrame(buffer: ArrayBuffer) {
  try {
    const pcm = new Int16Array(buffer)
    updateUi(detectFrequency(pcm))
  } catch (e) {
    /* 单帧解析失败直接跳过 */
  }
}

function ensurePermission(cb: () => void) {
  wx.getSetting({
    success: (res: any) => {
      if (res && res.authSetting && res.authSetting['scope.record']) {
        cb()
        return
      }
      wx.authorize({
        scope: 'scope.record',
        success: () => cb(),
        fail: () => {
          wx.showModal({
            title: '需要麦克风权限',
            content: '调音器需要麦克风采集音高，请在设置中开启录音权限',
            confirmText: '去设置',
            success: (r: any) => {
              if (r.confirm) {
                wx.openSetting({})
              }
            },
          })
        },
      })
    },
    fail: () => cb(),
  })
}

function startTuner() {
  if (running || !instRef) return
  ensurePermission(() => {
    if (!recorder) {
      const rm = wx.getRecorderManager() as any
      rm.onFrameRecorded((res: any) => {
        if (!running) return
        if (res && res.frameBuffer) {
          handleFrame(res.frameBuffer)
        }
      })
      rm.onError(() => {
        running = false
        if (instRef) {
          instRef.setData({ running: false, statusText: '麦克风不可用', active: false })
        }
      })
      rm.onStop(() => {
        running = false
        if (instRef) {
          instRef.setData({ running: false, active: false })
        }
      })
      recorder = rm
    }
    running = true
    lastUiAt = 0
    instRef.setData({ running: true, active: true, statusText: '正在识别…' })
    try {
      recorder.start({
        duration: 600000,
        sampleRate: SAMPLE_RATE,
        numberOfChannels: 1,
        format: 'PCM',
        frameSize: 4,
      })
    } catch (e) {
      running = false
      instRef.setData({ running: false, active: false, statusText: '无法启动录音' })
    }
  })
}

function stopTuner() {
  running = false
  if (recorder) {
    try {
      recorder.stop()
    } catch (e) {
      /* 忽略重复停止 */
    }
  }
  if (instRef) {
    instRef.setData({ running: false, active: false, statusText: '已停止' })
  }
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
    running: false,
    active: false,
    statusText: '点击开始，对着麦克风发声',
    note: '—',
    hint: '',
    centsText: '',
    centsClass: 'zero',
    barLeft: 50,
    freqText: '—',
    standard: '—',
  },

  lifetimes: {
    ready() {
      instRef = this
      applyScrollHeight(this)
    },
    detached() {
      stopTuner()
      instRef = null
    },
  },

  pageLifetimes: {
    hide() {
      if (running) stopTuner()
    },
  },

  methods: {
    onToggle() {
      if (running) {
        stopTuner()
      } else {
        startTuner()
      }
    },
  },
})