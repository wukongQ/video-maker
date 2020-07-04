import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import styles from './index.scss'

function TimeLine ({ nowTime, className }) {
  return (
    <div className={classnames(className)}>
      <div className={styles.showTime}>{nowTime}</div>
    </div>
  )
}

export default React.memo(TimeLine)
