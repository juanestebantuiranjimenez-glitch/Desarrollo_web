import { Navigate, Route, Routes } from 'react-router-dom'

import RutaProtegida, { SoloPublico } from './components/auth/RutaProtegida.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ClickSpark from './components/reactbits/ClickSpark.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Administradores from './pages/Administradores.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Estudiantes from './pages/Estudiantes.jsx'
import Facultades from './pages/Facultades.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import PanelEstudiante from './pages/PanelEstudiante.jsx'
import Programas from './pages/Programas.jsx'
import Registro from './pages/Registro.jsx'

function Inicio() {
  const { esEstudiante } = useAuth()
  return esEstudiante ? <PanelEstudiante /> : <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ClickSpark
          sparkColor="#7d2449"
          sparkSize={11}
          sparkRadius={26}
          sparkCount={8}
          sparkWidth={1.6}
          duration={480}
          easing="ease-out"
          style={{ minHeight: '100vh' }}
        >
          <Routes>
            <Route
              path="login"
              element={
                <SoloPublico>
                  <Login />
                </SoloPublico>
              }
            />
            <Route
              path="registro"
              element={
                <SoloPublico>
                  <Registro />
                </SoloPublico>
              }
            />

            <Route
              element={
                <RutaProtegida>
                  <AppLayout />
                </RutaProtegida>
              }
            >
              <Route index element={<Inicio />} />
              <Route
                path="mi-panel"
                element={
                  <RutaProtegida roles={['estudiante']}>
                    <PanelEstudiante />
                  </RutaProtegida>
                }
              />
              <Route
                path="facultades"
                element={
                  <RutaProtegida roles={['admin']}>
                    <Facultades />
                  </RutaProtegida>
                }
              />
              <Route
                path="programas"
                element={
                  <RutaProtegida roles={['admin']}>
                    <Programas />
                  </RutaProtegida>
                }
              />
              <Route
                path="estudiantes"
                element={
                  <RutaProtegida roles={['admin']}>
                    <Estudiantes />
                  </RutaProtegida>
                }
              />
              <Route
                path="administradores"
                element={
                  <RutaProtegida roles={['admin']}>
                    <Administradores />
                  </RutaProtegida>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ClickSpark>
      </ToastProvider>
    </AuthProvider>
  )
}
