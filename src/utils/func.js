/**
 * 计算获取渲染最长时间
 * @param {object} data
 */
export function getVideoMaxTime (data) {
  let tempMax = 0
  Object.entries(data).forEach(([key, list]) => {
    if (key !== 'transitions') {
      list.forEach(trackItem => {
        let { data: { start = 0, duration = 0 } = {} } = trackItem
        tempMax = Math.max(tempMax, start + duration)
      })
    }
  })
  return tempMax
}
