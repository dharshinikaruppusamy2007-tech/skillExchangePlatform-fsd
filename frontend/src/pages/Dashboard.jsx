import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Compass,
  PlusCircle,
  Sparkles,
  Star,
  UserPlus,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { getMySkills } from '../services/skills'
import { getRequests } from '../services/requests'
import { getUpcomingSessions } from '../services/sessions'
import { getReviewsForUser } from '../services/reviews'
import AppLayout from '../components/layout/AppLayout'
import StatCard from '../components/ui/StatCard'
import SkillTag from '../components/ui/SkillTag'
import UserAvatar from '../components/ui/UserAvatar'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ teach: 0, learn: 0, total: 0 })
  const [requests, setRequests] = useState({ sent: [], received: [] })
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [rating, setRating] = useState({ average: 0, count: 0 })

  useEffect(() => {
    let active = true
    Promise.all([
      getMySkills(),
      getRequests(),
      getUpcomingSessions(),
      getReviewsForUser(user?._id || ''),
    ])
      .then(([skillsRes, reqRes, sessRes, reviewsRes]) => {
        if (!active) return
        const skills = Array.isArray(skillsRes.data) ? skillsRes.data : []
        setStats({
          teach: skills.filter((s) => s.type === 'teach').length,
          learn: skills.filter((s) => s.type === 'learn').length,
          total: skills.length,
        })
        setRequests(reqRes.data || { sent: [], received: [] })
        setUpcomingCount(Array.isArray(sessRes.data) ? sessRes.data.length : 0)
        const summary = reviewsRes.data?.summary || {}
        setRating({
          average: summary.average || 0,
          count: summary.count || 0,
        })
      })
      .catch(() => {
        if (active) setError('Could not load your activity. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?._id])

  const pendingReceived = requests.received.filter((r) => r.status === 'pending')

  const activity = [
    ...requests.received.map((r) => ({ ...r, direction: 'received' })),
    ...requests.sent.map((r) => ({ ...r, direction: 'sent' })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const firstName = (user?.name || 'there').split(' ')[0]

  return (
    <AppLayout>
      <PageHeader title="Overview" subtitle="A quick snapshot of your skill exchange activity." />

      {/* Welcome banner */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-primary-700 p-6 text-white sm:p-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold">Welcome back, {firstName}!</h2>
            <p className="mt-2 text-sm text-primary-100">
              Teach what you know and learn what you love. Your community is
              waiting to exchange skills with you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/skills/add"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
            >
              <PlusCircle className="h-4 w-4" />
              Add a Skill
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Compass className="h-4 w-4" />
              Discover Skills
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
            <StatCard
              icon={Sparkles}
              label="Skills I Can Teach"
              value={stats.teach}
              accent="primary"
            />
            <StatCard
              icon={BookOpen}
              label="Skills I Want to Learn"
              value={stats.learn}
              accent="sky"
            />
            <StatCard
              icon={ArrowLeftRight}
              label="Requests Sent"
              value={requests.sent.length}
              accent="emerald"
            />
            <StatCard
              icon={UserPlus}
              label="Awaiting My Response"
              value={pendingReceived.length}
              accent="amber"
            />
            <Link to="/sessions" className="block">
              <StatCard
                icon={CalendarClock}
                label="Upcoming Sessions"
                value={upcomingCount}
                accent="primary"
              />
            </Link>
            <StatCard
              icon={Star}
              label="Avg Rating"
              value={rating.count ? Number(rating.average).toFixed(1) : '—'}
              accent="amber"
            />
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Recent activity */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
                <Link
                  to="/requests"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {activity.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
                    No exchange requests yet. Discover a skill and start an exchange!
                  </div>
                ) : (
                  activity.map((item) => {
                    const isReceived = item.direction === 'received'
                    const other = isReceived ? item.sender : item.receiver
                    return (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <UserAvatar name={other?.name} profileImage={other?.profileImage} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-gray-700">
                            <span className="font-semibold text-ink">{other?.name}</span>{' '}
                            {isReceived ? 'wants to learn' : 'requested to learn'}
                            {item.skill?.skillName && (
                              <>
                                {' '}
                                <span className="font-semibold text-ink">
                                  {item.skill.skillName}
                                </span>
                              </>
                            )}{' '}
                            {isReceived ? 'from you' : 'from your offer'}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <SkillTag tone={item.status}>{item.status}</SkillTag>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Quick tips */}
            <section>
              <h2 className="text-lg font-semibold text-ink">Get Started</h2>
              <div className="mt-3 space-y-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                {[
                  { step: '01', text: 'Add the skills you can teach to your profile.' },
                  { step: '02', text: 'Discover skills others offer near you.' },
                  { step: '03', text: 'Send an exchange request to start trading skills.' },
                ].map((tip) => (
                  <div key={tip.step} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                      {tip.step}
                    </span>
                    <p className="pt-0.5 text-sm text-gray-600">{tip.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  )
}

export default Dashboard