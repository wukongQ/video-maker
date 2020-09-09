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
          url: 'https://cdn.aidigger.com/Modi/ModiKuro/algorithm/video/washtube/video/84797c0e-a40a-11ea-9ef6-87968572cc5a_8b36cace-a40a-11ea-a6b4-e180e1c0d9cd.mp4',
          start: 0,
          duration: 1000000,
          rangeStart: 2000,
          rangeEnd: 11000
        }
      },
      {
        type: 'video',
        id: uuidv4(),
        data: {
          url: 'https://cdn.aidigger.com/Modi/ModiKuro/page_convertor/video_014c1df4-f6d2-4778-8661-7ab6ca472037.webm',
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
          start: 7000,
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
