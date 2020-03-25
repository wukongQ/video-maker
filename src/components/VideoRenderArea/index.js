import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import classnames from 'classnames'
import { RenderOperationBar } from '@components'
import { getVideoMaxTime } from '@utils/func.js'
import CanvasRender from '@utils/render.js'
import styles from './index.scss'

let canvasRender = null

function VideoRenderArea ({ data, nowTime, onNowTimeChange, className }) {
  const canvasRef = useRef(null)
  const [maxTime, setMaxTime] = useState(0)

  useLayoutEffect(() => {
    let canvas = canvasRef.current
    let s = window.getComputedStyle(canvas)
    setMaxTime(getVideoMaxTime(data))
    canvasRender = new CanvasRender(canvas, data, {
      width: parseInt(s.width),
      height: parseInt(s.height)
    })
    console.log('data effect')
  }, [data])

  // useEffect(() => {
  // }, [nowTime])

  const [playStatus, setPlayStatus] = useState(false)
  useEffect(() => {
    if (playStatus) {
      canvasRender.start(nowTime, time => {
        onNowTimeChange(time)
        if (time >= maxTime - 20) {
          console.log(time)
          setPlayStatus(false)
        }
      })
    } else {
      canvasRender.pause()
    }
  }, [playStatus])

  return (
    <div className={classnames(className, styles.container)}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} />
      </div>
      <RenderOperationBar
        playStatus={playStatus}
        nowTime={nowTime}
        maxTime={maxTime}
        onChange={({ type, value }) => {
          console.log(type, value)
          switch (type) {
            case 'status':
              setPlayStatus(value)
              break
            case 'time':
              onNowTimeChange(value)
              canvasRender.renderFrame(value)
              break
          }
        }} />
    </div>
  )
}

export default VideoRenderArea
