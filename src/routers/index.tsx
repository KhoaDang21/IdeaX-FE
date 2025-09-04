import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import StartupsJoin from '../pages/StartupsJoin'
import InvestorsJoin from '../pages/InvestorsJoin'
import App from '../App'
import AdminDashboard from '../pages/Admin/Dashboard'
import StartupDashboard from '../pages/Startup/Dashboard'
import InvestorDashboard from '../pages/Investor/Dashboard'
import MyProjects from '../pages/Startup/MyProjects'
import Roommeet from '../pages/Startup/Roommeet'
import Profile from '../pages/Startup/Profile'
import Payment from '../pages/Startup/Payment'
import StartupLayout from '../components/StartupLayout'
import FindProjects from '../pages/Investor/FindProjects'
import ProgressTracking from '../pages/Investor/ProgressTracking'
import InvestedProjects from '../pages/Investor/InvestedProjects'
import Payments from '../pages/Investor/Payments'
import UserManagement from '../pages/Admin/UserManagement'
import ProjectManagement from '../pages/Admin/ProjectManagement'
import FinancialManagement from '../pages/Admin/FinancialManagement'
import RoomAndContract from '../pages/Admin/RoomAndContract'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route index element={<Home />} />
                <Route path="start" element={<StartupsJoin />} />
                <Route path="start/investor" element={<InvestorsJoin />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/project-management" element={<ProjectManagement />} />
            <Route path="/admin/financial-management" element={<FinancialManagement />} />
            <Route path="/admin/room-and-contract" element={<RoomAndContract />} />
            <Route path="/startup" element={<StartupLayout />}>
                <Route path="dashboard" element={<StartupDashboard />} />
                <Route path="my-projects" element={<MyProjects />} />
                <Route path="roommeet" element={<Roommeet />} />
                <Route path="profile" element={<Profile />} />
                <Route path="payment" element={<Payment />} />
            </Route>
            <Route path="/investor/dashboard" element={<InvestorDashboard />} />
            <Route path="/investor/find-projects" element={<FindProjects />} />
            <Route path="/investor/progress-tracking" element={<ProgressTracking />} />
            <Route path="/investor/invested-projects" element={<InvestedProjects />} />
            <Route path="/investor/payments" element={<Payments />} />
            <Route path="*" element={<Home />} />
        </Routes>
    )
}


