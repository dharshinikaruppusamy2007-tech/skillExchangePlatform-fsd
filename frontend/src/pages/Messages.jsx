import { useEffect, useState } from 'react'
import { MessageSquareText } from 'lucide-react'

import { getConversations } from '../services/messages'
import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Toast from '../components/ui/Toast'
import ChatWindow from '../components/chat/ChatWindow'

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const Messages = () => {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await getConversations()
      setConversations(res.data.conversations || [])
      setError('')
    } catch {
      setError('Failed to load conversations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Refresh the last-message preview whenever the open thread changes.
  useEffect(() => {
    if (!selected) return
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.otherUserId])

  return (
    <AppLayout>
      <PageHeader
        title="Messages"
        subtitle="Chat with people you have an accepted exchange with."
      />

      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Conversation list */}
          <section className="lg:col-span-1">
            {conversations.length === 0 ? (
              <EmptyState
                icon={MessageSquareText}
                title="No conversations yet"
                message="Once someone accepts your exchange request — or you accept theirs — you can chat right here."
              />
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const active = selected?.otherUserId === conversation.otherUserId
                  return (
                    <button
                      key={conversation.otherUserId}
                      type="button"
                      onClick={() => setSelected(conversation)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-gray-100 bg-white shadow-sm hover:border-primary-100 hover:shadow'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={conversation.name}
                          profileImage={conversation.profileImage}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-ink">
                              {conversation.name}
                            </p>
                            {conversation.lastMessageAt && (
                              <span className="shrink-0 text-xs text-gray-400">
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-primary-600">
                            {conversation.skillName}
                            {conversation.category ? ` · ${conversation.category}` : ''}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {conversation.lastMessage || 'Start the conversation'}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Thread */}
          <section className="lg:col-span-2">
            <div className="h-[70vh] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:h-[calc(100vh-220px)]">
              {selected ? (
                <ChatWindow
                  userId={selected.otherUserId}
                  onBack={() => setSelected(null)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <MessageSquareText className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">Select a conversation</h3>
                  <p className="mt-1 max-w-xs text-sm text-gray-500">
                    Choose a member from the list to read and send messages.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  )
}

export default Messages