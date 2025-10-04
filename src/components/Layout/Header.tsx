import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LogOut, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
  breadcrumbs?: { label: string; path: string }[]
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm p-4 lg:p-6 flex justify-between items-center">
      {/* Left Section: Title and Breadcrumbs */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="text-sm font-medium text-gray-500 mb-1 hidden sm:block">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'text-gray-800'
                      : 'hover:text-indigo-600 cursor-pointer'
                  }
                  onClick={() => navigate(crumb.path)}
                >
                  {crumb.label}
                </span>
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2">/</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right Section: User Info and Logout */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.email || 'Пользователь'}
          </p>
          <p className="text-xs text-gray-500">
            ID: {user?.id.substring(0, 8)}...
          </p>
        </div>
        <UserCircle className="w-8 h-8 text-indigo-600" />
        <button
          onClick={handleLogout}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 transition duration-150"
          title="Выход"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
