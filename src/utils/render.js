import { getVideoMaxTime } from '@utils/func.js'
import { render } from 'less'

HTMLVideoElement.prototype.vmPaused = true
HTMLVideoElement.prototype.vmPause = function () {
  this.vmPaused = true
  this.pause()
}
HTMLVideoElement.prototype.vmPlay = function () {
  this.vmPaused = false
  return this.play()
}

export default class CanvasRender {
  trackItemLinked = {}
  renderAnimaId = 0

  constructor (canvasEle, data, size) {
    this.canvasEle = canvasEle
    this.data = data
    this.size = size
    this.maxTime = getVideoMaxTime(data)
    this.ctx = this.canvasEle.getContext('2d')

    this.canvasEle.width = this.size.width
    this.canvasEle.height = this.size.height

    this.createVideoDom()
    this.renderFrame(0, true)
  }

  createVideoDom () {
    const { videos = [] } = this.data
    videos.forEach(video => {
      const { data: { url } = {} } = video
      const tempEle = document.createElement('video')
      Object.assign(tempEle, {
        crossOrigin: 'anonymous',
        preload: 'auto',
        volume: 0,
        src: url
      })
      !this.trackItemLinked[video.id] && (this.trackItemLinked[video.id] = {
        playPromise: null,    // play()调用后返回的promise，用于判断是否在play()调用过程中
        isPreSetCurrentTime: false // currentTime提前赋值标识，优化切换不同视频渲染时的卡顿
      })
      this.trackItemLinked[video.id].videoEle = tempEle
    })
  }

  fillCanvasBg () {
    this.ctx.fillRect(0, 0, this.size.width, this.size.height)
  }

  start (time, timeChangeCb) {
    this.stop()
    let start = 0
    let spendTime = 0
    const startRender = timestamp => {
      if (timestamp) {
        start === 0 && (start = timestamp)
        spendTime = timestamp - start
      }
      const newTime = parseInt(time + spendTime)
      this.renderAnimaId = window.requestAnimationFrame(startRender)
      this.renderFrame(newTime)
      timeChangeCb && timeChangeCb(newTime)
    }
    startRender()
  }

  skip (time) {
    this.stop()
    this.renderFrame(time, true)
  }

  async stop () {
    window.cancelAnimationFrame(this.renderAnimaId)

    const videoPause = () => {
      const { videos=[] } = this.data
      videos.forEach(async video => {
        let trackItem = this.trackItemLinked[video.id]
        let ele = trackItem.videoEle
        trackItem.playPromise && await trackItem.playPromise
        !ele.vmPaused && ele.vmPause()
        trackItem.playPromise = null
      })
    }
    videoPause()
  }

  /**
   * 渲染单帧画面
   * @param {number} time 当前渲染时间
   * @param {boolean} isSingle 是否为仅渲染单帧，仅渲染单帧模式下，视频处理不一样
   */
  renderFrame (time, isSingle) {
    this.videoFrameRender(time, isSingle)
  }

  async videoFrameRender (time, isSingle) {
    const { videos=[] } = this.data
    let nowRender = 0
    for (let video of videos) {
      const { id, data: { start, rangeStart, rangeEnd } = {} } = video
      let trackItem = this.trackItemLinked[id]
      let videoEle = trackItem.videoEle
      if (this._isVideoInRender(video, time)) {
        nowRender++
        let renderTime = rangeStart + time - start
        if (isSingle) {
          !videoEle.vmPaused && videoEle.vmPause()
          await CanvasRender.changeVideoCurrentTime(videoEle, renderTime/1000)
        } else if(videoEle.vmPaused) {
          videoEle.vmPaused = false // 防止调用多次currentTime，导致视频卡住
          !trackItem.isPreSetCurrentTime && await CanvasRender.changeVideoCurrentTime(videoEle, renderTime/1000)
          trackItem.playPromise = videoEle.play()
          await trackItem.playPromise
          trackItem.playPromise = null
          trackItem.isPreSetCurrentTime = false
        }
        this.drawVideo(videoEle)
      } else if (this._isVideoInPreSetCurrent(video, time)) {
        CanvasRender.changeVideoCurrentTime(videoEle, rangeStart/1000)
        trackItem.isPreSetCurrentTime = true
      } else {
        !videoEle.vmPaused && videoEle.vmPause()
      }
    }
    if (nowRender === 0) {
      this.fillCanvasBg()
    }
  }

  textFrameRender (time) {
    console.log(time)
  }

  drawVideo (videoEle) {
    const cw = this.size.width
    const ch = this.size.height
    const vw = videoEle.videoWidth
    const vh = videoEle.videoHeight
    const cRatio = cw / ch
    const vRatio = vw / vh
    let dx, dy, dWidth, dHeight
    if (vRatio >= cRatio) {
      dWidth = cw
      dHeight = Math.floor((vh / vw) * cw)
      dx = 0
      dy = Math.floor((ch - dHeight) / 2)
    } else {
      dHeight = ch
      dWidth = Math.floor((vw / vh) * ch)
      dy = 0
      dx = Math.floor((cw - dWidth) / 2)
    }
    this.fillCanvasBg()
    this.ctx.drawImage(videoEle, dx, dy, dWidth, dHeight)
  }

  static changeVideoCurrentTime (videoEle, time) {
    return new Promise((resolve, reject) => {
      // [!problem]timeupdate触发时并不能保证当前video已经是currentTime的画面
      // const handleUpdate = () => {
      //   console.log('timeupdate', videoEle.currentTime)
      //   videoEle.removeEventListener('timeupdate', handleUpdate)
      //   resolve()
      // }
      // videoEle.addEventListener('timeupdate', handleUpdate)
      const handleSeeked = () => {
        videoEle.removeEventListener('seeked', handleSeeked)
        resolve()
      }
      videoEle.addEventListener('seeked', handleSeeked)
      videoEle.currentTime = time
    })
  }
  
  /**
   * 判断是否为当前播放视频
   * @param {object} video video数据
   * @param {number} time 当前渲染时间
   */
  _isVideoInRender (video, time) {
    const { data: { start, rangeStart, rangeEnd } = {} } = video
    return start <= time && start + rangeEnd - rangeStart >= time
  }

  /**
   * 判断是否为将要播放的视频
   * @param {object} video video数据
   * @param {number} time 当前渲染时间
   */
  _isVideoInPreSetCurrent (video, time) {
    const preTime = 2000
    const { id, data: { start } = {} } = video
    let trackItem = this.trackItemLinked[id]
    return !trackItem.isPreSetCurrentTime && start <= time + preTime && start > time
  }
}
