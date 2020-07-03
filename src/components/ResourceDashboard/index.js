import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import styles from './index.scss'

function ResourceDashboard ({ className }) {
  return (
    <div className={classnames(className)}>1</div>
  )
}

export default React.memo(ResourceDashboard)
