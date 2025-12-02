import { useState } from 'react'
import Sidebar from './Sidebar'
import GenomicsChat from './GenomicsChat'
import PedigreeChart from './PedigreeChart'

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('genomics')
  const [chatHistory, setChatHistory] = useState([
    { id: '1', name: 'BRCA1 Gene Analysis', timestamp: new Date() }
  ])
  const [activeChat, setActiveChat] = useState('1')

  const handleNewChat = () => {
    const newChat = {
      id: String(Date.now()),
      name: 'New Chat',
      timestamp: new Date()
    }
    setChatHistory([newChat, ...chatHistory])
    setActiveChat(newChat.id)
  }

  const handleDeleteChat = (chatId) => {
    setChatHistory(chatHistory.filter(c => c.id !== chatId))
    if (activeChat === chatId) {
      setActiveChat(chatHistory[0]?.id || '1')
    }
  }

  const handleRenameChat = (chatId, newName) => {
    setChatHistory(chatHistory.map(c => 
      c.id === chatId ? { ...c, name: newName } : c
    ))
  }

  return (
    <div className="flex h-screen bg-slate-50">
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
      />
      
      <div className="flex-1 flex flex-col">
        {activeSection === 'genomics' ? (
          <GenomicsChat 
            chatId={activeChat}
            chatName={chatHistory.find(c => c.id === activeChat)?.name || 'Chat'}
          />
        ) : (
          <PedigreeChart />
        )}
      </div>
    </div>
  )
}
