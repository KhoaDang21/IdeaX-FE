import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import StartupsJoin from '../pages/StartupsJoin'
import InvestorsJoin from '../pages/InvestorsJoin'
import App from '../App'
import StartupDashboard from '../pages/Startup/Dashboard'
import MyProjects from '../pages/Startup/MyProjects'
import Roommeet from '../pages/Startup/Roommeet'
import Profile from '../pages/Startup/Profile'
import Payment from '../pages/Startup/Payment'
import SubmitNewProject from '../pages/Startup/NewProject'
import StartupLayout from '../components/StartupLayout'
import FindProjects from '../pages/Investor/FindProjects'
import ProgressTracking from '../pages/Investor/ProgressTracking'
import InvestedProjects from '../pages/Investor/InvestedProjects'
import Payments from '../pages/Investor/Payments'
import InvestorLayout from '../components/InvestorLayout'
import UserManagement from '../pages/Admin/UserManagement'
import ProjectManagement from '../pages/Admin/ProjectManagement'
import FinancialManagement from '../pages/Admin/FinancialManagement'
import RoomAndContract from '../pages/Admin/RoomAndContract'
import AdminLayout from '../components/AdminLayout'
import ProfileInvestor from '../pages/Investor/ProfileInvestor'

// admin layout moved to components/AdminLayout

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<App />}>
                <Route index element={<Home />} />
                <Route path="start" element={<StartupsJoin />} />
                <Route path="start/investor" element={<InvestorsJoin />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="user-management" element={<UserManagement />} />
                <Route path="project-management" element={<ProjectManagement />} />
                <Route path="financial-management" element={<FinancialManagement />} />
                <Route path="room-and-contract" element={<RoomAndContract />} />
            </Route>
            <Route path="/startup" element={<StartupLayout />}>
                <Route path="dashboard" element={<StartupDashboard />} />
                <Route path="my-projects" element={<MyProjects />} />
                <Route path="roommeet" element={<Roommeet />} />
                <Route path="profile" element={<Profile />} />
                <Route path="payment" element={<Payment />} />
                <Route path="new-project" element={<SubmitNewProject />} />
            </Route>
            <Route path="/investor" element={<InvestorLayout />}>
                <Route path="find-projects" element={<FindProjects />} />
                <Route path="progress-tracking" element={<ProgressTracking />} />
                <Route path="invested-projects" element={<InvestedProjects />} />
                <Route path="payments" element={<Payments />} />
                <Route path="profile-investor" element={<ProfileInvestor />} />
            </Route>
            <Route path="*" element={<Home />} />
        </Routes>
    )
}


