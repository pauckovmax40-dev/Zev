import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Zap } from 'lucide-react'

export const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    // Note: Email confirmation is disabled as per instructions.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/app/acceptance',
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        'Регистрация прошла успешно! Вы можете войти, используя свой email и пароль.',
      )
      setEmail('')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Zap className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
            Создать аккаунт
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Начните управлять ремонтом
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            label="Пароль (минимум 6 символов)"
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
          {message && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">
              {message}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Зарегистрироваться
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
