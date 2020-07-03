import { getVideoMaxTime } from '@utils/func.js'

export default class CanvasRender {
  constructor (canvasEle, data, size) {
    this.canvasEle = canvasEle
    this.data = data
    this.size = size
    this.maxTime = getVideoMaxTime(data)
    this.ctx = this.canvasEle.getContext('2d')
    this.trackItemLinked = {}

    this.renderAnimaId = 0

    this.canvasEle.width = this.size.width
    this.canvasEle.height = this.size.height

    this.createVideoDom()
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

  stop (time) {
    window.cancelAnimationFrame(this.renderAnimaId)
    for (let [key, obj] of Object.entries(this.trackItemLinked)) {
      obj.videoEle.pause()
    }
  }

  renderFrame (time, isSingle) {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height)
    this.videoRenderFrame(time, isSingle)
    this.textRenderFrame(time)
  }

  videoRenderFrame (time, isSingle) {
    const { videos = [] } = this.data
    videos.forEach(async video => {
      const { id, data: { start, duration } } = video
      let trackObj = this.trackItemLinked[id]
      let tempEle = trackObj.videoEle
      if (start <= time && start + duration >= time) {
        if (tempEle.paused || isSingle) {
          tempEle.currentTime = time / 1000
        }
        if (isSingle) {
          !tempEle.paused && tempEle.pause()
        } else if (tempEle.paused) {
          await tempEle.play()
        }
        // let renderVideo = () => {
        //   this.trackItemLinked[id].frameId = window.requestAnimationFrame(renderVideo)
        //   this.drawVideo(tempEle)
        // }
        // renderVideo()

        // tempEle.currentTime = time / 1000
        // tempEle.paused && tempEle.play()
        this.drawVideo(tempEle)
      } else {
        !tempEle.paused && tempEle.pause()
      }
    })
  }

  textRenderFrame (time) {
    const { texts = [] } = this.data
  }

  transitionRender () {

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
}
