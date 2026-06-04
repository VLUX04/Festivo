import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import { getAuthToken, getStoredUser, isAuthenticated } from '../utils/auth';

const API_BASE_URL = 'http://localhost:3000';

type FriendChat = {
  chatId: number;
  username: string;
  name: string;
  role: string;
};

type ChatMessage = {
  id: number;
  content: string;
  sent_at: string;
  username: string;
  name: string | null;
};

type SharePayload = {
  kind: 'share';
  itemType: string;
  itemId: number;
  title: string;
  url: string;
  body?: string;
};

const isSharePayload = (value: unknown): value is SharePayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    payload.kind === 'share' &&
    typeof payload.itemType === 'string' &&
    typeof payload.itemId === 'number' &&
    typeof payload.title === 'string' &&
    typeof payload.url === 'string'
  );
};

const parseSharePayload = (content: string): SharePayload | null => {
  try {
    const parsed = JSON.parse(content) as unknown;
    return isSharePayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const formatRole = (role: string): string => {
  if (role === 'professional') {
    return 'Professional';
  }

  if (role === 'customer') {
    return 'Customer';
  }

  return role;
};

const initial = (value: string): string => value.trim().charAt(0).toUpperCase() || '?';

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loggedIn = isAuthenticated();
  const currentUser = React.useMemo(() => getStoredUser(), []);

  const [friendChats, setFriendChats] = React.useState<FriendChat[]>([]);
  const [selectedChatId, setSelectedChatId] = React.useState<number | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const [loadingFriends, setLoadingFriends] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState('');

  const selectedChat = React.useMemo(() => {
    if (!selectedChatId) {
      return null;
    }

    return friendChats.find((chat) => chat.chatId === selectedChatId) ?? null;
  }, [friendChats, selectedChatId]);

  React.useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
    }
  }, [loggedIn, navigate]);

  const loadFriends = React.useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      setLoadingFriends(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/chat/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load friends');
      }

      setFriendChats(data.chats as FriendChat[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const loadMessages = React.useCallback(async (chatId: number) => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      setLoadingMessages(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load messages');
      }

      setMessages(data.messages as ChatMessage[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  React.useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedChatId);
  }, [selectedChatId, loadMessages]);

  React.useEffect(() => {
    const targetUsername = searchParams.get('chat');

    if (!targetUsername || friendChats.length === 0) {
      return;
    }

    const matchedChat = friendChats.find((chat) => chat.username === targetUsername);

    if (matchedChat) {
      setSelectedChatId(matchedChat.chatId);
      return;
    }

    const token = getAuthToken();

    if (!token) {
      return;
    }

    const ensureChat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ friendUsername: targetUsername }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to open chat');
        }

        await loadFriends();
      } catch (chatError) {
        setError(chatError instanceof Error ? chatError.message : 'Unable to open chat');
      }
    };

    void ensureChat();
  }, [friendChats, loadFriends, searchParams]);

  const handleSendMessage = async () => {
    if (!selectedChatId || !draft.trim()) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setSending(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: String(selectedChatId),
          content: draft.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      setDraft('');
      await loadMessages(selectedChatId);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!loggedIn) {
    return null;
  }

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
          <h1 className='text-[#fff3b0] text-5xl font-bold mb-6'>FRIENDS & COMMUNITY</h1>
          <p className='text-[#a89060] text-xl'>Real-time conversations with your existing connections.</p>
        </div>

        {error ? (
          <div className='w-[82%] border-2 border-[#ff6b6b] bg-[#1a0f10] p-4 text-[#ffb3b3]'>
            {error}
          </div>
        ) : null}

        <div className='w-[82%] flex gap-6 mb-8'>
          <div className='w-1/3 space-y-6'>
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <h2 className='text-[#fff3b0] text-xl font-bold mb-4'>Your Friends</h2>
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {loadingFriends ? (
                  <p className='text-[#a89060]'>Loading friends...</p>
                ) : friendChats.length === 0 ? (
                  <p className='text-[#a89060]'>No active chats yet</p>
                ) : (
                  friendChats.map((friend) => (
                    <div
                      key={`${friend.chatId}-${friend.username}`}
                      className={`bg-[#2a1f20] border-2 transition p-3 cursor-pointer ${selectedChatId === friend.chatId ? 'border-[#fff3b0]' : 'border-[#483d30] hover:border-[#fff3b0]'}`}
                      onClick={() => setSelectedChatId(friend.chatId)}
                    >
                      <div className='flex gap-3 items-start mb-2'>
                        <div
                          className='w-12 h-12 border border-[#483d30] flex-shrink-0 flex items-center justify-center text-[#fff3b0] bg-[#120707] font-bold'
                          aria-hidden='true'
                        >
                          {initial(friend.name || friend.username)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-[#fff3b0] font-bold text-sm truncate'>{friend.name}</p>
                          <p className='text-[#a89060] text-xs'>@{friend.username}</p>
                          <p className='text-[#8b7355] text-xs'>{formatRole(friend.role)}</p>
                        </div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedChatId(friend.chatId);
                        }}
                        className='w-full border border-[#fff3b0] text-[#fff3b0] text-xs py-1 hover:bg-[#3d2d24] transition'
                      >
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className='w-2/3 border-4 border-[#fff3b0] bg-[#1a0f10] p-6 flex flex-col'>
            <h2 className='text-[#fff3b0] text-2xl font-bold mb-4'>Messages</h2>

            {selectedChat ? (
              <div className='flex flex-col h-full mt-auto'>
                <div className='mb-4 pb-4 border-b border-[#483d30]'>
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className='text-[#a89060] hover:text-[#fff3b0] transition'
                  >
                    ← Back to friends
                  </button>
                  <h3 className='text-[#fff3b0] text-xl font-bold mt-2'>{selectedChat.name}</h3>
                  <p className='text-[#a89060]'>@{selectedChat.username}</p>
                </div>

                <div className='flex-1 overflow-y-auto mb-4 space-y-2'>
                  {loadingMessages ? (
                    <p className='text-[#a89060] text-center mt-8'>Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className='text-[#a89060] text-center mt-8'>No messages yet. Start a conversation!</p>
                  ) : (
                    messages.map((message) => {
                      const fromCurrentUser = message.username === currentUser?.username;
                      const sharedPayload = parseSharePayload(message.content);

                      return (
                        <div key={message.id} className={`flex ${fromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs px-4 py-2 rounded ${fromCurrentUser ? 'bg-[#e3a63e] text-[#1a0f10]' : 'bg-[#483d30] text-[#fff3b0]'}`}
                          >
                            {sharedPayload ? (
                              <>
                                <p className='text-xs uppercase tracking-[0.2em] font-semibold'>
                                  Shared {sharedPayload.itemType}
                                </p>
                                <p className='mt-1 font-bold'>{sharedPayload.title}</p>
                                {sharedPayload.body ? <p className='mt-1'>{sharedPayload.body}</p> : null}
                              </>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            <p className='text-[10px] mt-1 opacity-80'>
                              {new Date(message.sent_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={draft}
                    placeholder='Type a message...'
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    className='flex-1 px-3 py-2 bg-[#2a1f20] border border-[#a89060] text-[#fff3b0] placeholder-[#8b7355] focus:outline-none'
                  />
                  <button
                    type='button'
                    disabled={sending || !draft.trim()}
                    onClick={() => void handleSendMessage()}
                    className='px-4 py-2 border-2 border-[#fff3b0] text-[#fff3b0] hover:bg-[#2d1d14] transition disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center h-full text-[#a89060] mt-auto'>
                <p>Select a friend to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FriendsPage;
