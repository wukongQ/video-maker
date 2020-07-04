import React, { useState, useEffect, useRef } from 'react'
import classnames from 'classnames'
import { RenderOperationBar } from '@components'
import { getVideoMaxTime } from '@utils/func.js'
import CanvasRender from '@utils/render.js'
// import CanvasRender from '@utils/renderGl.js'
import styles from './index.scss'

function VideoRenderArea ({ data, nowTime, onNowTimeChange, className }) {
  const [maxTime, setMaxTime] = useState(0)
  const [isPlayed, setIsPlayed] = useState(false)
  const canvasRef = useRef(null)
  let canvasRender = useRef(null)

  useEffect(() => {
    let canvas = canvasRef.current
    let s = window.getComputedStyle(canvas)
    setMaxTime(getVideoMaxTime(data))
    canvasRender.current = new CanvasRender(canvas, data, {
      width: parseInt(s.width),
      height: parseInt(s.height)
    })
  }, [data])

  useEffect(() => {
    if (isPlayed) {
      canvasRender.current.start(nowTime, timeChangeCb)
    } else {
      canvasRender.current.stop()
    }
  }, [isPlayed])

  const onBarTimeChange = (time) => {
    console.log(`time change: ${time}`)
    onNowTimeChange(time)
    setIsPlayed(false)
    canvasRender.current.skip(time)
  }

  const timeChangeCb = time => {
    onNowTimeChange(time)
    if (time >= maxTime-20) {
      setIsPlayed(false)
    }
  }

  return (
    <div className={classnames(className, styles.container)}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} />
      </div>
      <RenderOperationBar
        isPlayed={isPlayed}
        nowTime={nowTime}
        maxTime={maxTime}
        onChange={({ type, value }) => {
          console.log(type, value)
          switch (type) {
            case 'status':
              setIsPlayed(value)
              break
            case 'time':
              onBarTimeChange(value)
              break
          }
        }} />
    </div>
  )
}

export default React.memo(VideoRenderArea)
