import { useEffect, useState } from 'react'

import Navbar from '../../components/Navbar'
import ProfileForm from '../../components/profile/ProfileForm'
import { getProfile, updateProfile } from '../../services/profile'

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

const Avatar = ({ profile }) => {
  const initials = getInitials(profile?.name)
  if (profile?.profileImage) {
    return (
      <img
        src={profile.profileImage}
        alt={`${profile.name}'s avatar`}
        className="h-20 w-20 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
      {initials}
    </div>
  )
}

const EmptyValue = () => <span className="text-gray-400">Not set yet</span>

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      try {
        const res = await getProfile()
        if (active) {
          setProfile(res.data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              'Failed to load your profile. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  const handleSave = async (values) => {
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const res = await updateProfile(values)
      setProfile(res.data)
      setEditing(false)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save your profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and edit your public skill exchange profile.
        </p>

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          {profile && !editing ? (
            <>
              <div className="flex flex-col items-center text-center">
                <Avatar profile={profile} />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {profile.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
                {profile.location && (
                  <p className="mt-1 text-sm text-gray-500">{profile.location}</p>
                )}
              </div>

              <dl className="mt-6 space-y-4 border-t border-gray-100 pt-6 text-sm">
                <div>
                  <dt className="font-medium text-gray-700">Bio</dt>
                  <dd className="mt-1 whitespace-pre-line text-gray-600">
                    {profile.bio || <EmptyValue />}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Experience level</dt>
                  <dd className="mt-1 text-gray-600">
                    {profile.experienceLevel || 'Beginner'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Skills I Can Teach</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {profile.skillsToTeach?.length ? (
                      profile.skillsToTeach.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <EmptyValue />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Skills I Want to Learn</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {profile.skillsToLearn?.length ? (
                      profile.skillsToLearn.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <EmptyValue />
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess('')
                    setEditing(true)
                  }}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            <ProfileForm
              profile={profile}
              onSubmit={handleSave}
              onCancel={handleCancelEdit}
              saving={saving}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile