import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth Pages
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { ForgotPassword } from './pages/Auth/ForgotPassword'
import { ResetPassword } from './pages/Auth/ResetPassword'

// App Pages
import { AcceptanceMode } from './pages/Acceptance/AcceptanceMode'
import { NewAcceptance } from './pages/Acceptance/NewAcceptance'
import { UPDAssemblyMode } from './pages/UPD/UPDAssemblyMode'
import CreateUPD from './pages/UPD/CreateUPD'
import { Archive } from './pages/Archive/Archive'
import { Settings } from './pages/Settings'
import { Motors } from './pages/Reference/Motors'
import { Counterparties } from './pages/Reference/Counterparties'
import { Subdivisions } from './pages/Reference/Subdivisions'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes (App Layout) */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="acceptance" replace />} />
            <Route path="acceptance" element={<AcceptanceMode />} />
            <Route path="acceptance/new" element={<NewAcceptance />} />
            <Route path="upd-assembly" element={<UPDAssemblyMode />} />
            <Route path="archive" element={<Archive />} />
            <Route path="settings" element={<Settings />} />
            {/* Reference Data */}
            <Route path="reference/motors" element={<Motors />} />
            <Route path="reference/counterparties" element={<Counterparties />} />
            <Route path="reference/subdivisions" element={<Subdivisions />} />
          </Route>

          {/* UPD Routes (outside app layout) */}
          <Route path="/upd" element={<ProtectedRoute />}>
            <Route index element={<UPDAssemblyMode />} />
            <Route path="create" element={<CreateUPD />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/app/acceptance" replace />} />
          <Route path="*" element={<Navigate to="/app/acceptance" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
