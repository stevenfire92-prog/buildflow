import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import AuthGate from '@/components/AuthGate';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
// Add page imports here
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Subscription from './pages/Subscription';
import AccountSettings from './pages/AccountSettings';
import Team from './pages/Team';
import NewProject from './pages/NewProject';
import Templates from './pages/Templates';
import GrowthDashboard from './pages/GrowthDashboard';
import Portfolio from './pages/Portfolio';
import DeadlineCalendar from './pages/DeadlineCalendar';
import WebApps from './pages/WebApps';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NarratorGuide from './components/narrator/NarratorGuide';
import BuilderAiAssistant from './components/assistant/BuilderAiAssistant';

const AuthenticatedApp = () => {
  // Render the main app
  return (
    <AuthGate>
    <Routes>
    {/* Add your page Route elements here */}
    <Route path="/" element={<Home />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/share" element={<Portfolio />} />
    <Route path="/apps" element={<WebApps />} />
    <Route path="/web-apps" element={<WebApps />} />

    <Route element={<ProtectedRoute />} >
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/project-details" element={<ProjectDetails />} />
    <Route path="/subscription" element={<Subscription />} />
    <Route path="/new-project" element={<NewProject />} />
    <Route path="/templates" element={<Templates />} />
    <Route path="/growth-dashboard" element={<GrowthDashboard />} />
    <Route path="/calendar" element={<DeadlineCalendar />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/team" element={<Team />} />
    </Route>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<PageNotFound />} />
    </Routes>
    </AuthGate>
  );
};


function App() {
  React.useEffect(() => {
    import('@/lib/founder').then(({ checkFounderUrl }) => checkFounderUrl());
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <LanguageProvider>
            <AuthenticatedApp />
            <NarratorGuide />
            <BuilderAiAssistant />
          </LanguageProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App