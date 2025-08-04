import { BrowserRouter as Router, Routes, Route } from "react-router";
import { NotificationProvider } from "@/react-app/contexts/NotificationContext";
import HomePage from "@/react-app/pages/Home";
import Login from "@/react-app/pages/Login";
import AuthCallback from "@/react-app/pages/AuthCallback";
import UserManagement from "@/react-app/pages/UserManagement";
import Members from "@/react-app/pages/Members";
import MemberDetail from "@/react-app/pages/MemberDetail";
import Departments from "@/react-app/pages/Departments";
import Finance from "@/react-app/pages/Finance";
import Notifications from "@/react-app/pages/Notifications";
import NotificationsUltraSimple from "@/react-app/pages/NotificationsUltraSimple";
import NotificationsDebug from "@/react-app/pages/NotificationsDebug";
import MembersSimple from "@/react-app/pages/MembersSimple";
import DepartmentsSimple from "@/react-app/pages/DepartmentsSimple";
import FinanceSimple from "@/react-app/pages/FinanceSimple";
import Events from "@/react-app/pages/Events";
import Reports from "@/react-app/pages/Reports";
import Settings from "@/react-app/pages/Settings";
import Communication from "@/react-app/pages/Communication";


export default function App() {
  const basename = process.env.NODE_ENV === 'production' ? '/igrejaconnect' : '';
  
  return (
    <Router basename={basename}>
      <NotificationProvider>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/users-full" element={<UserManagement />} />
        <Route path="/members" element={<MembersSimple />} />
        <Route path="/members-original" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/departments" element={<DepartmentsSimple />} />
        <Route path="/departments-original" element={<Departments />} />
        <Route path="/events" element={<Events />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/communication" element={<Communication />} />

        <Route path="/finance" element={<FinanceSimple />} />
        <Route path="/finance-original" element={<Finance />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications-simple" element={<NotificationsUltraSimple />} />
        <Route path="/notifications-debug" element={<NotificationsDebug />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      </NotificationProvider>
    </Router>
  );
}
