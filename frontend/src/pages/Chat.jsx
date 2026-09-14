import { useParams } from 'react-router-dom'

import AppLayout from '../components/layout/AppLayout'
import ChatWindow from '../components/chat/ChatWindow'

// Full-page chat thread, reachable at /messages/:userId. The list view
// (/messages) embeds the same window in its right pane.
const Chat = () => {
  const { userId } = useParams()

  return (
    <AppLayout>
      <div className="h-[calc(100vh-260px)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:h-[calc(100vh-220px)]">
        <ChatWindow userId={userId} />
      </div>
    </AppLayout>
  )
}

export default Chat