import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^\S+@\S+\.\S+$/

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}

    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!EMAIL_REGEX.test(form.email)) newErrors.email = 'Enter a valid email address'

    if (!form.password) newErrors.password = 'Password is required'

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/profile')
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your profile">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login