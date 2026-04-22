import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

export default function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                    <Routes>
                        <Route path = "/login" element = { <LoginPage /> } />
                        <Route path = "/register" element = { <RegisterPage /> } />
                        <Route
                            path = "/dashboard" 
                            element = {
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path = "/" element = { <Navigate to = "/dashboard" replace /> } />
                        <Route path = "*" element = { <Navigate to = "/dashboard" replace /> } />
                    </Routes>
            </ToastProvider>
        </BrowserRouter>
    )
}
