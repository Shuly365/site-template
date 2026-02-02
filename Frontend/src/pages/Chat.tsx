import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Send, Trash2, Settings } from 'lucide-react';

export default function Chat() {
  const { user, logout, isLoading, isAdmin } = useAuth();
  const { messages, sendMessage, deleteMessage } = useMessages();
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    
    sendMessage(user.id, user.username, input.trim());
    setInput('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Group Chat</h1>
          <p className="text-sm text-muted-foreground">
            {user.username} {isAdmin && <span className="text-primary">(Admin)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.username === user.username;
              return (
                <div
                  key={msg.id}
                  className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2">
                    {!isOwn && isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium opacity-70">{msg.username}</p>
                      )}
                      <p className="break-words">{msg.content}</p>
                      <p className="mt-1 text-xs opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {isOwn && isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
