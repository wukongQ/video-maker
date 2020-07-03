import React, { useState } from 'react'
import { VideoRenderArea, TimeLine, ResourceDashboard } from '@components'
import { usePreload } from '@hooks'
import { v4 as uuidv4 } from 'uuid'
import styles from './index.scss'

function EditPage () {
  const [lineData, setLineData] = useState({
    videos: [
      {
        type: 'video',
        id: uuidv4(),
        data: {
          url: 'https://cdn.aidigger.com/modiAudio/7f33af87-6528-43dc-9176-3dd94f029adc.mp4',
          start: 0,
          duration: 27392,
          rangeStart: 5000,
          rangeEnd: 10000
        }
      },
      {
        type: 'video',
        id: uuidv4(),
        data: {
          url: 'https://cdn.aidigger.com/modiAudio/0c303712-8d9d-437b-be38-8e341b30cd61.mp4',
          start: 5000,
          duration: 20032,
          rangeStart: 10000,
          rangeEnd: 16000
        }
      }
    ],
    audios: [],
    texts: [
      {
        type: 'text',
        id: uuidv4(),
        data: {
          value: '测试文本',
          start: 0,
          duration: 2000
        }
      }
    ],
    transitons: []
  })

  const [nowTime, setNowTime] = useState(0)
  const { preloading } = usePreload(lineData)

  return (
    <div className={styles.container}>
      {
        preloading
          ? (
            <div>视频预加载中...</div>
          )
          : (
          <>
            <div className={styles.top}>
              <ResourceDashboard />
              <VideoRenderArea
                className={styles.renderArea}
                data={lineData}
                nowTime={nowTime}
                onNowTimeChange={value => setNowTime(value)}
              />
            </div>
            <div className={styles.bottom}>
              <TimeLine
                data={lineData}
                nowTime={nowTime}
                onNowTimeChange={value => setNowTime(value)}
                onChange={data => setLineData(data)}
              />
            </div>
          </>
          )
      }
    </div>
  )
}

export default EditPage
