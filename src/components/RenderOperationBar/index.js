import React, { useState, useEffect } from 'react'
import styles from './index.scss'

export const BtnTypes = {
  goStart: 'goStart',
  back: 'back',
  play: 'play',
  pause: 'pause',
  forward: 'forward',
  goEnd: 'goEnd'
}

const btnList = [
  {
    type: BtnTypes.goStart,
    name: '起始'
  },
  {
    type: BtnTypes.back,
    name: '快退'
  },
  {
    type: BtnTypes.play,
    name: '播放'
  },
  {
    type: BtnTypes.pause,
    name: '暂停'
  },
  {
    type: BtnTypes.forward,
    name: '快进'
  },
  {
    type: BtnTypes.goEnd,
    name: '结束'
  }
]

const jumpTime = 4000

function RenderOperationBar ({ isPlayed, nowTime, maxTime, onChange }) {
  const handleBtnClick = (btn, e) => {
    let type = ''
    let value = ''
    if ([BtnTypes.play, BtnTypes.pause].includes(btn.type)) {
      type = 'status'
      value = !isPlayed
    } else {
      type = 'time'
      switch (btn.type) {
        case BtnTypes.goStart:
          value = 0
          break
        case BtnTypes.goEnd:
          value = maxTime
          break
        case BtnTypes.back:
          value = nowTime - jumpTime < 0 ? 0 : nowTime - jumpTime
          break
        case BtnTypes.forward:
          value = nowTime + jumpTime > maxTime ? maxTime : nowTime + jumpTime
          break
      }
    }
    onChange && onChange({
      type,
      value
    })
  }

  return (
    <div className={styles.container}>
      {
        btnList.map(btn => {
          if ((isPlayed && btn.type === BtnTypes.play) || (!isPlayed && btn.type === BtnTypes.pause)) {
            return ''
          }
          return (
            <div className={styles.btn} key={btn.type} onClick={handleBtnClick.bind(this, btn)}>
              {btn.name}
            </div>
          )
        })
      }
    </div>
  )
}

export default React.memo(RenderOperationBar)
