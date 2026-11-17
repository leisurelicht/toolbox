/* ===== 常量 ===== */
const SAMPLE_RATE = 44100
const FRAME_SIZE = 4
const DURATION = 600000
const UI_INTERVAL = 100
const MIN_DB = 20
const MAX_DB = 120
const CALIBRATION_MIN = 40
const CALIBRATION_MAX = 120
const DEFAULT_CALIBRATION = 90

/* ===== 测量状态（录音管理器是单例） ===== */
let recorder: WechatMiniprogram.RecorderManager | null = null
let activeInst: any = null
let pageAlive = false
let pageVisible = false
let starting = false

let smoothedDbfs = -100
let hasReading = false
let lastDbfs = -100
let peakDb = 0
let totalDb = 0
let sampleCount = 0
let lastRenderAt = 0
let measureStartedAt = 0
let elapsedTimer: ReturnType<typeof setInterval> | null = null

/* ===== 工具函数 ===== */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function levelFor(db: number): { className: string; label: string } {
  if (db < 40) return { className: 'quiet', label: '安静' }
  if (db < 60) return { className: 'normal', label: '日常' }
  if (db < 75) return { className: 'loud', label: '嘈杂' }
  if (db < 90) return { className: 'noisy', label: '很吵' }
  return { className: 'extreme', label: '极吵' }
}

function toPercent(db: number): number {
  return clamp(Math.round(((db - MIN_DB) / (MAX_DB - MIN_DB)) * 100), 0, 100)
}

function formatElapsed(seconds: number): string {
  const safe = Math.max(0, seconds)
  return `${pad2(Math.floor(safe / 60))}:${pad2(safe % 60)}`
}

/* 单帧 PCM → dBFS（16-bit 小端，满幅 = 0 dBFS） */
function computeDbfs(samples: Int16Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i] / 32768
    sum += value * value
  }
  const rms = Math.sqrt(sum / samples.length)
  if (rms < 1e-7) return -100
  return Math.max(-100, Math.min(0, 20 * Math.log10(rms)))
}

/* ===== 读数展示 ===== */
function applyReading(inst: any, db: number) {
  const level = levelFor(db)
  inst.setData({
    dbText: String(db),
    dbfsText: smoothedDbfs.toFixed(1),
    levelPercent: toPercent(db),
    peakPercent: toPercent(peakDb),
    levelClass: level.className,
    levelHint: level.label,
    peakText: `${Math.round(peakDb)} dB`,
    avgText: sampleCount > 0 ? `${Math.round(totalDb / sampleCount)} dB` : '—',
  })
}

function handleDbfs(inst: any, dbfs: number) {
  smoothedDbfs = hasReading ? smoothedDbfs * 0.5 + dbfs * 0.5 : dbfs
  hasReading = true
  lastDbfs = smoothedDbfs

  const db = clamp(Math.round(smoothedDbfs + inst.data.calibration), 0, MAX_DB)
  peakDb = Math.max(peakDb, db)
  totalDb += db
  sampleCount += 1

  const now = Date.now()
  if (now - lastRenderAt < UI_INTERVAL) return
  lastRenderAt = now
  applyReading(inst, db)
}

function applyCalibration(inst: any) {
  if (!hasReading) return
  const db = clamp(Math.round(lastDbfs + inst.data.calibration), 0, MAX_DB)
  peakDb = db
  totalDb = db
  sampleCount = 1
  applyReading(inst, db)
}

/* ===== 录音 ===== */
function ensureRecorder(): boolean {
  if (recorder) return true
  try {
    const manager = wx.getRecorderManager()
    recorder = manager

    manager.onFrameRecorded(res => {
      const inst = activeInst
      if (!inst || !inst.data.measuring) return
      if (!res || !res.frameBuffer) return
      const samples = new Int16Array(res.frameBuffer)
      if (samples.length === 0) return
      handleDbfs(inst, computeDbfs(samples))
    })

    manager.onError(() => {
      if (activeInst) stopMeasurement(activeInst, '录音失败，请检查麦克风权限')
    })

    manager.onStop(() => {
      if (!activeInst || !activeInst.data.measuring) return
      stopMeasurement(activeInst, '录音已停止（单次最长 10 分钟）')
    })

    return true
  } catch (err) {
    console.warn('获取录音管理器失败', err)
    return false
  }
}

function updateElapsed(inst: any) {
  if (activeInst !== inst || !inst.data.measuring) return
  const seconds = Math.floor((Date.now() - measureStartedAt) / 1000)
  inst.setData({ elapsedText: formatElapsed(seconds) })
}

function clearElapsedTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
    elapsedTimer = null
  }
}

function stopMeasurement(inst: any, message?: string) {
  if (inst.data.measuring) {
    inst.setData({ measuring: false, statusText: '已停止' })
  }
  if (activeInst === inst) activeInst = null
  clearElapsedTimer()

  try {
    wx.setKeepScreenOn({ keepScreenOn: false })
  } catch (err) {
    console.warn('关闭屏幕常亮失败', err)
  }
  if (recorder) {
    try {
      recorder.stop()
    } catch (err) {
      console.warn('停止录音失败', err)
    }
  }
  if (message) {
    wx.showToast({ title: message, icon: 'none', duration: 1800 })
  }
}

function beginMeasurement(inst: any) {
  if (!pageAlive || !pageVisible) return
  if (!ensureRecorder()) {
    wx.showToast({ title: '当前设备无法录音', icon: 'none', duration: 1500 })
    return
  }

  clearElapsedTimer()
  smoothedDbfs = -100
  hasReading = false
  lastDbfs = -100
  peakDb = 0
  totalDb = 0
  sampleCount = 0
  lastRenderAt = 0
  measureStartedAt = Date.now()
  activeInst = inst

  try {
    wx.setKeepScreenOn({ keepScreenOn: true })
  } catch (err) {
    console.warn('开启屏幕常亮失败', err)
  }

  inst.setData({
    measuring: true,
    statusText: '测量中',
    dbText: '--',
    dbfsText: '--',
    levelPercent: 0,
    peakPercent: 0,
    levelClass: 'quiet',
    levelHint: '等待声音',
    peakText: '—',
    avgText: '—',
    elapsedText: '00:00',
  })

  elapsedTimer = setInterval(() => updateElapsed(inst), 500)
  wx.vibrateShort({ type: 'light' })

  try {
    recorder.start({
      duration: DURATION,
      sampleRate: SAMPLE_RATE,
      numberOfChannels: 1,
      format: 'PCM',
      frameSize: FRAME_SIZE,
    })
  } catch (err) {
    stopMeasurement(inst, '无法启动录音，请检查麦克风')
  }
}

/* ===== 滚动区测高 ===== */
function applyScrollHeight(inst: any) {
  const query = wx.createSelectorQuery()
  query.select('.page-container').boundingClientRect()
  query.select('.top-area').boundingClientRect()
  query.exec((res: any[]) => {
    const container = res && res[0]
    const topArea = res && res[1]
    let h = 0
    if (container && topArea) {
      h = Math.round(container.height - (topArea.bottom - container.top))
    }
    if (!h || h <= 0) {
      const info = wx.getSystemInfoSync()
      const rpx = info.windowWidth / 750
      h = Math.round(info.windowHeight - 44 - (info.statusBarHeight || 0) - 700 * rpx)
    }
    if (h > 0) inst.setData({ scrollHeight: h })
  })
}

function remeasure(inst: any) {
  wx.nextTick(() => applyScrollHeight(inst))
}

/* ===== 页面 ===== */
Component({
  data: {
    measuring: false,
    statusText: '未开始',
    dbText: '--',
    dbfsText: '--',
    levelPercent: 0,
    peakPercent: 0,
    levelClass: 'quiet',
    levelHint: '等待测量',
    peakText: '—',
    avgText: '—',
    elapsedText: '00:00',
    calibration: DEFAULT_CALIBRATION,
    calibrationText: String(DEFAULT_CALIBRATION),
    scrollHeight: 0,
  },

  lifetimes: {
    attached() {
      pageAlive = true
    },
    ready() {
      applyScrollHeight(this)
    },
    detached() {
      pageAlive = false
      pageVisible = false
      starting = false
      if (activeInst === this) {
        activeInst = null
        clearElapsedTimer()
        try {
          wx.setKeepScreenOn({ keepScreenOn: false })
        } catch (err) {
          console.warn('关闭屏幕常亮失败', err)
        }
        if (recorder) {
          try {
            recorder.stop()
          } catch (err) {
            console.warn('停止录音失败', err)
          }
        }
      }
    },
  },

  pageLifetimes: {
    show() {
      pageVisible = true
      if (this.data.scrollHeight > 0) remeasure(this)
    },
    hide() {
      pageVisible = false
      if (this.data.measuring) stopMeasurement(this)
    },
  },

  methods: {
    onToggleMeasure() {
      if (this.data.measuring) {
        stopMeasurement(this)
        wx.vibrateShort({ type: 'light' })
        return
      }
      if (starting) return

      starting = true
      wx.authorize({
        scope: 'scope.record',
        success: () => {
          starting = false
          if (pageAlive && pageVisible) beginMeasurement(this)
        },
        fail: () => {
          starting = false
          wx.showModal({
            title: '需要麦克风权限',
            content:
              '分贝仪只在本机实时读取麦克风声音，不保存、不上传录音。请在设置中允许使用麦克风。',
            confirmText: '去设置',
            success: res => {
              if (res.confirm) wx.openSetting({})
            },
          })
        },
      })
    },

    onCalibrationInput(e: WechatMiniprogram.Input) {
      const text = e.detail.value
      const value = parseFloat(text)
      const calibration = isNaN(value)
        ? this.data.calibration
        : clamp(Math.round(value), CALIBRATION_MIN, CALIBRATION_MAX)
      this.setData({ calibrationText: text, calibration })
      applyCalibration(this)
    },

    onCalibrationBlur() {
      this.setData({ calibrationText: String(this.data.calibration) })
      applyCalibration(this)
    },

    onCalibrationMinus() {
      const calibration = clamp(this.data.calibration - 1, CALIBRATION_MIN, CALIBRATION_MAX)
      this.setData({ calibration, calibrationText: String(calibration) })
      applyCalibration(this)
    },

    onCalibrationPlus() {
      const calibration = clamp(this.data.calibration + 1, CALIBRATION_MIN, CALIBRATION_MAX)
      this.setData({ calibration, calibrationText: String(calibration) })
      applyCalibration(this)
    },

    onResetStats() {
      if (!hasReading) {
        peakDb = 0
        totalDb = 0
        sampleCount = 0
        this.setData({ peakText: '—', avgText: '—', peakPercent: 0 })
        return
      }

      const db = clamp(Math.round(lastDbfs + this.data.calibration), 0, MAX_DB)
      peakDb = db
      totalDb = db
      sampleCount = 1
      applyReading(this, db)
      wx.vibrateShort({ type: 'light' })
    },

    onShareAppMessage() {
      return {
        title: '分贝仪：实时看看周围有多吵',
        path: '/pages/decibel-meter/decibel-meter',
      }
    },
  },
})
