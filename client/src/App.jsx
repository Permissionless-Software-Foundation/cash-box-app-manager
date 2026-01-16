import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import HomeScreen from './components/HomeScreen'
import AppStore from './components/AppStore'
import 'bootstrap/dist/css/bootstrap.min.css'

function App () {
  return (
    <div className='App'>
      <NavigationBar />
      <Routes>
        <Route path='/' element={<HomeScreen />} />
        <Route path='/store' element={<AppStore />} />
      </Routes>
    </div>
  )
}

export default App
