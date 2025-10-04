import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Zap } from 'lucide-react'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/app/acceptance')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Zap className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
            Вход в систему
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Управление ремонтом электродвигателей
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            id="email"
            label="Email адрес"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            id="password"
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Войти
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Нет аккаунта?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Зарегистрироваться
            </Link>
          </p>
          <p className="mt-2">
            <Link
              to="/forgot-password"
              className="font-medium text-gray-500 hover:text-gray-700"
            >
              Забыли пароль?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
