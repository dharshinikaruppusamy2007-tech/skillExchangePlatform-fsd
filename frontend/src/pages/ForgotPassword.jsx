import { useState } from 'react'
import { Link } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import api from '../services/api'

const EMAIL_REGEX = /^\S+@\S+\.\S+$/

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    const fieldErrors = {}
    if (!email.trim()) fieldErrors.email = 'Email is required'
    else if (!EMAIL_REGEX.test(email)) fieldErrors.email = 'Enter a valid email address'

    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage({ type: 'success', text: res.data.message })
      setEmail('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset your password">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: '' }))
          }}
          error={errors.email}
        />

        {message.text && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword