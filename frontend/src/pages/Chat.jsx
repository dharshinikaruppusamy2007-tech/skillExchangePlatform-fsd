import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Avatar from '../components/Avatar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getMessages, sendMessage } from '../services/messages'

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const Bubble = ({ message, mine }) => (
  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
        mine
          ? 'bg-blue-600 text-white'
          : 'border border-gray-100 bg-white text-gray-800'
      }`}
    >
      <p className="whitespace-pre-line text-sm">{message.message}</p>
      <p className={`mt-1 text-xs ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
        {formatTime(message.createdAt)}
      </p>
    </div>
  </div>
)

const Chat = () => {
  const { userId } = useParams()
  const { user } = useAuth()

  const [partner, setPartner] = useState(null)
  const [request, setRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const bottomRef = useRef(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getMessages(userId)
        if (active) {
          setPartner(res.data.user)
          setRequest(res.data.request)
          setMessages(res.data.messages || [])
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || 'Failed to load the conversation. Please try again.'
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
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending || !request?._id) return

    setSending(true)
    setSendError('')
    try {
      const res = await sendMessage({
        receiverId: userId,
        requestId: request._id,
        message: text,
      })
      setMessages((prev) => [...prev, res.data])
      setDraft('')
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to send the message.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading conversation...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/messages"
          className="inline-block text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← Back to Messages
        </Link>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && partner && (
          <div className="mt-4 flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <Avatar name={partner.name} profileImage={partner.profileImage} size="h-12 w-12" />
            <div>
              <h1 className="text-base font-semibold text-gray-900">{partner.name}</h1>
              <p className="text-sm text-gray-500">
                {request?.skillName}
                {request?.category ? ` · ${request.category}` : ''}
              </p>
            </div>
          </div>
        )}

        {!error && partner && (
          <>
            <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No messages yet. Say hello and schedule your first exchange!
                </p>
              ) : (
                messages.map((message) => (
                  <Bubble
                    key={message._id}
                    message={message}
                    mine={String(message.sender?._id) === String(user?._id)}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                maxLength={2000}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
            {sendError && <p className="mt-2 text-sm text-red-600">{sendError}</p>}
          </>
        )}
      </main>
    </div>
  )
}

export default Chat