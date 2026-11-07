import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { GuestOnly, RequireAuth } from './auth/RouteGuards'
import { PabxLayout } from './layouts/PabxLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/pabx/DashboardPage'
import { PlaceholderPage } from './pages/pabx/PlaceholderPage'
import { SpeechAnalyticsPage } from './pages/pabx/SpeechAnalyticsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/pabx" element={<PabxLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="ramais" element={<PlaceholderPage title="Ramais" />} />
              <Route path="chamadas" element={<PlaceholderPage title="Chamadas" />} />
              <Route path="filas" element={<PlaceholderPage title="Filas" />} />
              <Route path="ura" element={<PlaceholderPage title="URA" />} />
              <Route path="gravacoes" element={<PlaceholderPage title="Gravações" />} />
              <Route path="speech-analytics" element={<SpeechAnalyticsPage />} />
              <Route path="configuracoes" element={<PlaceholderPage title="Configurações" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/pabx" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
