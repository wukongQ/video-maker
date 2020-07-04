import { useState, useEffect } from 'react'

function usePreload (data) {
  const [preloading, setPreloading] = useState(true)

  useEffect(() => {
    const { videos } = data
    const preloadArr = []
    videos.forEach(video => {
      const { data: { url, rangeStart } = {} } = video
      if (url) {
        preloadArr.push(preloadVideo(url, rangeStart))
      }
    })
    Promise.all(preloadArr).then(resList => {
      console.log('finish preload', resList)
      setPreloading(false)
    })
  }, [])

  return {
    preloading
  }
}

function preloadVideo (url, rangeStart) {
  return new Promise((resolve, reject) => {
    const videoEle = document.createElement('video')
    videoEle.addEventListener('canplaythrough', () => {
      resolve({
        duration: videoEle.duration * 1000
      })
    })
    videoEle.addEventListener('error', () => {
      resolve({ duration: -1 })
    })
    Object.assign(videoEle, {
      crossOrigin: 'anonymous',
      preload: 'auto',
      volume: 0,
      src: url
    })
  })
}

export default usePreload
