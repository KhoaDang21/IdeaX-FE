import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div style={{ background: '#ffffff' }}>
      <Outlet />
    </div>
  )
}

export default App
