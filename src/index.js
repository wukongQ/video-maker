import React from 'react'
import ReactDOM from 'react-dom'
import { EditPage } from '@routes'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

function App () {
  return (
    <Switch>
      <Route path='/' component={EditPage} />
    </Switch>
  )
}

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
)
