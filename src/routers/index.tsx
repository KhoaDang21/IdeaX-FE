import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import App from '../App'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route index element={<Home />} />
                <Route path="startups" element={<div style={{ padding: 20 }}>Startups page (đang xây dựng)</div>} />
                <Route path="investors" element={<div style={{ padding: 20 }}>Investors page (đang xây dựng)</div>} />
                <Route path="start" element={<div style={{ padding: 20 }}>Getting started (đang xây dựng)</div>} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
        </Routes>
    )
}


