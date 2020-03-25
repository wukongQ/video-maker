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
    let { videos = [] } = this.data
    videos.forEach(video => {
      let { data: { url } = {} } = video
      let tempEle = document.createElement('video')
      Object.assign(tempEle, {
        crossOrigin: 'anonymous',
        preload: 'auto',
        volume: 0,
        src: url
      })
      // tempEle.play()
      !this.trackItemLinked[video.id] && (this.trackItemLinked[video.id] = {})
      this.trackItemLinked[video.id].videoEle = tempEle
    })
  }

  start (time, timeChange) {
    this.pause()
    let start = 0
    let spendTime = 0
    let startRender = (timestamp) => {
      if (timestamp) {
        start === 0 && (start = timestamp)
        spendTime = timestamp - start
      }
      let newTime = parseInt(time + spendTime)
      this.renderAnimaId = window.requestAnimationFrame(startRender)
      this.renderFrame(newTime)
      timeChange && timeChange(newTime)
    }
    startRender()
  }

  pause (time) {
    window.cancelAnimationFrame(this.renderAnimaId)
  }

  renderFrame (time) {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height)
    this.videoRenderFrame(time)
    this.textRenderFrame(time)
  }

  videoRenderFrame (time) {
    let { videos = [] } = this.data
    videos.forEach(video => {
      let { id, data: { start, duration } } = video
      if (start <= time && start + duration >= time) {
        let trackObj = this.trackItemLinked[id]
        let tempEle = trackObj.videoEle
        // if (trackObj.seekedEvent) {
        //   tempEle.removeEventListener('seeked', trackObj.seekedEvent)
        // }
        // trackObj.seekedEvent = this.drawVideo.bind(this, tempEle)
        // tempEle.addEventListener('seeked', trackObj.seekedEvent)
        tempEle.currentTime = time / 1000
        // let renderVideo = () => {
        //   this.trackItemLinked[id].frameId = window.requestAnimationFrame(renderVideo)
        //   this.drawVideo(tempEle)
        // }
        // renderVideo()
        tempEle.paused && tempEle.play()
        this.drawVideo(tempEle)
      }
    })
  }

  textRenderFrame (time) {
    let { texts = [] } = this.data
  }

  transitionRender () {

  }

  drawVideo (videoEle) {
    let cw = this.size.width
    let ch = this.size.height
    let vw = videoEle.videoWidth
    let vh = videoEle.videoHeight
    let cRatio = cw / ch
    let vRatio = vw / vh
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
