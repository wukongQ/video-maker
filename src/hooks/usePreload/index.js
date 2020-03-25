import { useState, useEffect } from 'react'

function usePreload (data) {
  const [preloading, setPreloading] = useState(true)

  useEffect(() => {
    let { videos } = data
    let preloadArr = []
    videos.forEach(video => {
      let { data: { url } = {} } = video
      if (url) {
        preloadArr.push(preloadVideo(url))
      }
    })
    Promise.all(preloadArr).then(resList => {
      console.log('finish preload')
      setPreloading(false)
    })
  }, [])

  return {
    preloading
  }
}

function preloadVideo (url) {
  // return window.fetch(url)
  return new Promise((resolve, reject) => {
    let videoEle = document.createElement('video')
    videoEle.addEventListener('canplay', () => {
      resolve()
    })
    videoEle.addEventListener('error', () => {
      resolve()
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
