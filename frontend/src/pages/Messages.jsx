import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Avatar from '../components/Avatar'
import Navbar from '../components/Navbar'
import { getConversations } from '../services/messages'

const formatDateTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const ConversationCard = ({ conversation }) => (
  <Link
    to={`/messages/${conversation.otherUserId}`}
    className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
  >
    <div className="flex items-center gap-4">
      <Avatar
        name={conversation.name}
        profileImage={conversation.profileImage}
        size="h-12 w-12"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {conversation.name}
          </h3>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-xs text-gray-400">
              {formatDateTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          {conversation.skillName}
          {conversation.category ? ` · ${conversation.category}` : ''}
        </p>
        <p className="mt-1 truncate text-sm text-gray-600">
          {conversation.lastMessage || 'Start the conversation'}
        </p>
      </div>
    </div>
  </Link>
)

const Messages = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await getConversations()
        if (active) {
          setConversations(res.data.conversations || [])
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || 'Failed to load conversations. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chat with people you have an accepted exchange with.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              You have no conversations yet. Once someone accepts your exchange request —
              or you accept theirs — you can chat right here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {conversations.map((conversation) => (
              <ConversationCard key={conversation.otherUserId} conversation={conversation} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Messages