import React, { useState, useEffect } from 'react'
import styles from './index.scss'

const btnList = [
  {
    type: 'goStart',
    name: '起始'
  },
  {
    type: 'back',
    name: '快退'
  },
  {
    type: 'play',
    name: '播放'
  },
  {
    type: 'pause',
    name: '暂停'
  },
  {
    type: 'forward',
    name: '快进'
  },
  {
    type: 'goEnd',
    name: '结束'
  }
]

const jumpTime = 4000

function RenderOperationBar ({ playStatus, nowTime, maxTime, onChange }) {
  const handleBtnClick = (btn, e) => {
    let type = ''
    let value = ''
    if (['play', 'pause'].includes(btn.type)) {
      type = 'status'
      value = !playStatus
    } else {
      type = 'time'
      switch (btn.type) {
        case 'goStart':
          value = 0
          break
        case 'goEnd':
          value = maxTime
          break
        case 'back':
          value = nowTime - jumpTime < 0 ? 0 : nowTime - jumpTime
          break
        case 'forward':
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
          if ((playStatus && btn.type === 'play') || (!playStatus && btn.type === 'pause')) {
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

export default RenderOperationBar
