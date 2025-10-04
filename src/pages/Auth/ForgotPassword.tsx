import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Zap } from 'lucide-react'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        'Инструкции по сбросу пароля отправлены на ваш email. Проверьте папку "Входящие" (и спам).',
      )
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Zap className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
            Сброс пароля
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Введите email, чтобы получить ссылку для сброса
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <Input
            id="email"
            label="Email адрес"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
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
            Отправить ссылку для сброса
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  )
}
