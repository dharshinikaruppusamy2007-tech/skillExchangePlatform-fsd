import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageSquareText, Send } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { getMessages, sendMessage } from '../../services/messages'
import UserAvatar from '../ui/UserAvatar'

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
      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        mine
          ? 'rounded-br-sm bg-primary-600 text-white'
          : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'
      }`}
    >
      <p className="whitespace-pre-line text-sm">{message.message}</p>
      <p className={`mt-1 text-xs ${mine ? 'text-primary-100' : 'text-gray-400'}`}>
        {formatTime(message.createdAt)}
      </p>
    </div>
  </div>
)

// Reusable chat thread for an accepted exchange with `userId`.
const ChatWindow = ({ userId, onBack }) => {
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
      <div className="flex items-center justify-center p-10 text-sm text-gray-500">
        Loading conversation...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {error ? (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        partner && (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back to conversations"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <UserAvatar name={partner.name} profileImage={partner.profileImage} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{partner.name}</p>
                <p className="truncate text-xs text-gray-400">
                  {request?.skillName}
                  {request?.category ? ` · ${request.category}` : ''}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/60 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <MessageSquareText className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <p className="mt-3 text-sm text-gray-500">
                    No messages yet. Say hello and schedule your first exchange!
                  </p>
                </div>
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

            {/* Composer */}
            <form onSubmit={handleSend} className="border-t border-gray-100 bg-white p-3">
              <div className="flex items-end gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  className="flex-1 rounded-full border border-gray-200 bg-canvas px-4 py-2.5 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {sendError && <p className="mt-2 px-2 text-sm text-red-600">{sendError}</p>}
            </form>
          </>
        )
      )}
    </div>
  )
}

export default ChatWindow