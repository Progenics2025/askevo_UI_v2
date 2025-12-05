import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquarePlus, Dna, GitBranch, Trash2, LogOut, MoreVertical, Edit2, Settings, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import SettingsDialog from './SettingsDialog';
import logo from './assets/askevo-logo.png';

export default function Sidebar({
  activeSection,
  setActiveSection,
  chatHistory,
  activeChat,
  setActiveChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  user,
  onLogout,
  onToggle,
}) {
  const { t } = useTranslation();
  const [editingChat, setEditingChat] = useState(null);
  const [editName, setEditName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleEditClick = (chat) => {
    setEditingChat(chat.id);
    setEditName(chat.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onRenameChat(editingChat, editName.trim());
    }
    setEditingChat(null);
  };

  return (
    <>
      <div className="w-80 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 flex flex-col shadow-lg" data-testid="sidebar-container">
        {/* Header */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center justify-center mb-5 relative">
            <div className="flex flex-col items-center">
              <img src={logo} alt="askEVO" className="h-14" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-cyan-400 hover:bg-slate-800"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white font-bold shadow-lg transition-all hover:scale-[1.02] h-11"
            data-testid="new-chat-button"
          >
            <MessageSquarePlus className="mr-2 h-5 w-5" />
            {t('newChat')}
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setActiveSection('genomics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'genomics'
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg scale-[1.02]'
              : 'text-white hover:bg-slate-800'
              }`}
            data-testid="genomics-assistant-nav"
          >
            <Dna className="h-5 w-5" />
            {t('genomicsAssistant')}
          </button>

          <button
            onClick={() => setActiveSection('pedigree')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'pedigree'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-[1.02]'
              : 'text-white hover:bg-slate-800'
              }`}
            data-testid="pedigree-chart-nav"
          >
            <GitBranch className="h-5 w-5" />
            {t('pedigreeChart')}
          </button>
        </div>

        <Separator className="my-2 bg-slate-700" />

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-5 py-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">{t('chatHistory')}</h2>
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2 pb-4" data-testid="chat-history-list">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all ${activeChat === chat.id
                    ? 'bg-gradient-to-r from-cyan-900/40 to-violet-900/40 border border-cyan-700/50 shadow-sm'
                    : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    setActiveSection('genomics');
                  }}
                  data-testid={`chat-history-item-${chat.id}`}
                >
                  <MessageSquarePlus className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="flex-1 text-sm text-white truncate font-semibold">
                    {chat.name}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-200"
                        data-testid={`chat-menu-${chat.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(chat)} data-testid={`edit-chat-${chat.id}`}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        {t('rename')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="text-red-600"
                        data-testid={`delete-chat-${chat.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="mt-auto bg-slate-700" />

        {/* User Profile & Settings */}
        <div className="p-4 space-y-2">
          {/* Settings Button */}
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-white hover:bg-slate-800 hover:text-cyan-400 transition-colors"
            onClick={() => setSettingsOpen(true)}
            data-testid="settings-button"
          >
            <Settings className="h-5 w-5" />
            <span className="font-semibold">{t('settings')}</span>
          </Button>

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Avatar className="h-10 w-10 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-500 text-white font-bold text-base">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate" data-testid="user-name-display">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white truncate font-medium">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-9 w-9 p-0 text-white hover:text-red-400 hover:bg-red-900/20 transition-colors"
              data-testid="logout-button"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Chat Name Dialog */}
      <Dialog open={editingChat !== null} onOpenChange={() => setEditingChat(null)}>
        <DialogContent data-testid="rename-chat-dialog">
          <DialogHeader>
            <DialogTitle className="font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>{t('renameChat')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="chat-name" className="font-semibold">{t('chatName')}</Label>
              <Input
                id="chat-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="border-2 border-cyan-200 focus:border-cyan-400"
                data-testid="rename-chat-input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingChat(null)} data-testid="cancel-rename-button" className="font-semibold">
                {t('cancel')}
              </Button>
              <Button onClick={handleSaveEdit} data-testid="save-rename-button" className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold">
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
