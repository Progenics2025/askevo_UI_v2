import { useState, useEffect } from 'react'
import { PanelLeft } from 'lucide-react'
import Sidebar from './Sidebar'
import GenomicsChat from './GenomicsChat'
import PedigreeChart from './PedigreeChart'
import { apiService } from '@/lib/apiService'

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('genomics')
  const [chatHistory, setChatHistory] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Load chat sessions from database
  useEffect(() => {
    const loadChatSessions = async () => {
      try {
        // Check if user has auth token
        const token = localStorage.getItem('token')
        if (!token) {
          // No auth, start with default chat
          const defaultChat = {
            id: 'default-' + Date.now(),
            name: 'New Chat',
            timestamp: new Date()
          }
          setChatHistory([defaultChat])
          setActiveChat(defaultChat.id)
          setIsLoading(false)
          return
        }

        const sessions = await apiService.getChatSessions()
        const formattedSessions = sessions.map(s => ({
          id: s.id.toString(), // Backend returns 'id', not 'session_id'
          name: s.session_title || 'New Chat', // Backend returns 'session_title'
          timestamp: new Date(s.created_at)
        }))

        if (formattedSessions.length > 0) {
          setChatHistory(formattedSessions)
          setActiveChat(formattedSessions[0].id)
        } else {
          // No sessions, create default
          const defaultChat = {
            id: 'default-' + Date.now(),
            name: 'New Chat',
            timestamp: new Date()
          }
          setChatHistory([defaultChat])
          setActiveChat(defaultChat.id)
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
        // On error, create default chat
        const defaultChat = {
          id: 'default-' + Date.now(),
          name: 'New Chat',
          timestamp: new Date()
        }
        setChatHistory([defaultChat])
        setActiveChat(defaultChat.id)
      } finally {
        setIsLoading(false)
      }
    }

    loadChatSessions()
  }, [])

  const handleNewChat = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await apiService.createChatSession('New Chat')
        const newChat = {
          id: response.session_id.toString(),
          name: 'New Chat',
          timestamp: new Date()
        }
        setChatHistory([newChat, ...chatHistory])
        setActiveChat(newChat.id)
      } else {
        // No token, create local chat
        const newChat = {
          id: String(Date.now()),
          name: 'New Chat',
          timestamp: new Date()
        }
        setChatHistory([newChat, ...chatHistory])
        setActiveChat(newChat.id)
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
      // Fallback to local chat
      const newChat = {
        id: String(Date.now()),
        name: 'New Chat',
        timestamp: new Date()
      }
      setChatHistory([newChat, ...chatHistory])
      setActiveChat(newChat.id)
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      if (token && !chatId.startsWith('default-')) {
        await apiService.deleteSession(chatId);
      }

      // Update local state
      setChatHistory(chatHistory.filter(c => c.id !== chatId))
      if (activeChat === chatId) {
        setActiveChat(chatHistory[0]?.id || null)
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  }

  const handleRenameChat = async (chatId, newName) => {
    try {
      const token = localStorage.getItem('token');
      if (token && !chatId.startsWith('default-')) {
        await apiService.renameSession(chatId, newName);
      }

      // Update local state
      setChatHistory(chatHistory.map(c =>
        c.id === chatId ? { ...c, name: newName } : c
      ))
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Overlay Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-full transform transition-all duration-300 ease-in-out 
          lg:relative lg:translate-x-0 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarOpen ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden'}
        `}
      >
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          chatHistory={chatHistory}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          user={user}
          onLogout={onLogout}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {activeSection === 'genomics' ? (
          <GenomicsChat
            chatId={activeChat}
            chatName={chatHistory.find(c => c.id === activeChat)?.name || 'Chat'}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <PedigreeChart
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        )}
      </div>
    </div>
  )
}
