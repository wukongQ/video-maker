import { getVideoMaxTime } from '@utils/func.js'
import { render } from 'less'

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
    
    this.ctx.fillRect(0, 0, this.canvasEle.width, this.canvasEle.height)
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
      !this.trackItemLinked[video.id] && (this.trackItemLinked[video.id] = {})
      this.trackItemLinked[video.id].videoEle = tempEle
    })
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

  skip (time, timeChangeCb) {
    this.stop()
    this.renderFrame(time, true)
    this.start(time, timeChangeCb)
  }

  async stop () {
    window.cancelAnimationFrame(this.renderAnimaId)

    const videoPause = () => {
      const { videos=[] } = this.data
      videos.forEach(async video => {
        let trackItem = this.trackItemLinked[video.id]
        let ele = trackItem.videoEle
        // trackItem.playPromise && await trackItem.playPromise
        !ele.paused && ele.pause()
        trackItem.playPromise = null
      })
    }
    videoPause()
  }

  renderFrame (time, isSingle) {
    this.videoFrameRender(time, isSingle)
  }

  async videoFrameRender (time, isSingle) {
    const { videos=[] } = this.data
    for (let video of videos) {
      const { id, data: { start, rangeStart, rangeEnd } = {} } = video
      let trackItem = this.trackItemLinked[id]
      let videoEle = trackItem.videoEle
      if (start <= time && start + rangeEnd - rangeStart >= time) {
        let renderTime = rangeStart + time - start
        if (isSingle) {
          !videoEle.paused && videoEle.pause()
          await CanvasRender.changeVideoCurrentTime(videoEle, renderTime/1000)
          this.drawVideo(videoEle)
        } else {
          if (videoEle.paused) {
            await CanvasRender.changeVideoCurrentTime(videoEle, renderTime/1000)
            // await videoEle.play()
            trackItem.playPromise = videoEle.play()
            await trackItem.playPromise
            trackItem.playPromise = null
          }
          this.drawVideo(videoEle)
        }
      } else {
        !videoEle.paused && videoEle.pause()
      }
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
    this.ctx.drawImage(videoEle, dx, dy, dWidth, dHeight)
  }

  static changeVideoCurrentTime (videoEle, time) {
    // [!problem]timeupdate触发时也并不能保证当前video已经是currentTime的画面
    return new Promise((resolve, reject) => {
      const handleUpdate = () => {
        videoEle.removeEventListener('timeupdate', handleUpdate)
        resolve()
      }
      videoEle.addEventListener('timeupdate', handleUpdate)
      videoEle.currentTime = time
    })
  }
}
