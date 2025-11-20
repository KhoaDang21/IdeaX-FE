import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import StartupLayout from "../components/StartupLayout";
import InvestorLayout from "../components/InvestorLayout";
import AdminLayout from "../components/AdminLayout";
import GlobalLoading from "../components/GlobalLoading";

// Lazy-loaded pages to split bundles and reduce main chunk size
const Home = React.lazy(() => import("../pages/Home"));
const Login = React.lazy(() => import("../pages/Login"));
const StartupsJoin = React.lazy(() => import("../pages/StartupsJoin"));
const InvestorsJoin = React.lazy(() => import("../pages/InvestorsJoin"));
const StartupDashboard = React.lazy(() => import("../pages/Startup/Dashboard"));
const MyProjects = React.lazy(() => import("../pages/Startup/MyProjects"));
const Roommeet = React.lazy(() => import("../pages/Startup/Roommeet"));
const Profile = React.lazy(() => import("../pages/Startup/Profile"));
const Payment = React.lazy(() => import("../pages/Startup/Payment"));
const SubmitNewProject = React.lazy(
  () => import("../pages/Startup/NewProject")
);
const FindProjects = React.lazy(() => import("../pages/Investor/FindProjects"));
const ProgressTracking = React.lazy(
  () => import("../pages/Investor/ProgressTracking")
);
const InvestedProjects = React.lazy(
  () => import("../pages/Investor/InvestedProjects")
);
const Payments = React.lazy(() => import("../pages/Investor/Payments"));
const UserManagement = React.lazy(
  () => import("../pages/Admin/UserManagement")
);
const ProjectManagement = React.lazy(
  () => import("../pages/Admin/ProjectManagement")
);
const FinancialManagement = React.lazy(
  () => import("../pages/Admin/FinancialManagement")
);
const RoomAndContract = React.lazy(
  () => import("../pages/Admin/RoomAndContract")
);
const ProjectDetails = React.lazy(
  () => import("../pages/Startup/ProjectDetails")
);
const ProfileInvestor = React.lazy(
  () => import("../pages/Investor/ProfileInvestor")
);
const Room = React.lazy(() => import("../pages/Investor/Room"));
const ProjectDetailsadmin = React.lazy(
  () => import("../pages/Admin/ProjectDetails")
);
const AdminWithdrawals = React.lazy(
  () => import("../pages/Admin/AdminWithdrawals")
);

// admin layout moved to components/AdminLayout

export default function AppRoutes() {
  const Fallback = <GlobalLoading />;

  return (
    <Suspense fallback={Fallback}>
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
          <Route
            path="financial-management"
            element={<FinancialManagement />}
          />
          <Route path="room-and-contract" element={<RoomAndContract />} />
          <Route path="projects/:id" element={<ProjectDetailsadmin />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>
        <Route path="/startup" element={<StartupLayout />}>
          <Route path="dashboard" element={<StartupDashboard />} />
          <Route path="my-projects" element={<MyProjects />} />
          <Route path="roommeet" element={<Roommeet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment" element={<Payment />} />
          <Route path="new-project" element={<SubmitNewProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
        </Route>
        <Route path="/investor" element={<InvestorLayout />}>
          <Route path="find-projects" element={<FindProjects />} />
          <Route path="progress-tracking" element={<ProgressTracking />} />
          <Route path="invested-projects" element={<InvestedProjects />} />
          <Route path="room" element={<Room />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile-investor" element={<ProfileInvestor />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
