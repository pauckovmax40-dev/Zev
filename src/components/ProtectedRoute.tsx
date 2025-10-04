import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    // Simple loading screen while checking auth state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-indigo-600 text-xl">Загрузка...</div>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
