import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout'

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [friends, setFriends] = React.useState<Array<{name: string; image: string; mutualFriends: number; isFriend: boolean; role: string; location: string}>>([])
  const [selectedChat, setSelectedChat] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Record<string, Array<{text: string, sender: 'user' | 'friend'}>>>({});

  React.useEffect(() => {
    const chat = searchParams.get('chat');
    if (chat) {
      setSelectedChat(chat);
    }
  }, [searchParams]);

  const handleToggleFriend = (name: string) => {
    setFriends((previousFriends) =>
      previousFriends.map((friend) =>
        friend.name === name ? { ...friend, isFriend: !friend.isFriend } : friend,
      ),
    )
  }

  const handleViewProfile = (friendName: string) => {
    navigate(`/profile?friend=${friendName}`);
  }

  const handleSendMessage = (friendName: string, text: string) => {
    if (!text.trim()) return;
    
    setMessages((prev) => ({
      ...prev,
      [friendName]: [...(prev[friendName] || []), { text, sender: 'user' }],
    }));
  }

  const currentFriends = friends.filter((friend) => friend.isFriend)
  const notFriends = friends.filter((friend) => !friend.isFriend)
  
  const userLocation = '';
  const recommendedFriends = notFriends
    .filter((friend) => friend.location === userLocation && friend.mutualFriends > 0)
    .sort((a, b) => b.mutualFriends - a.mutualFriends)
    .slice(0, 5);

  const chatMessages = selectedChat ? messages[selectedChat] || [] : [];

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
            <h1 className='text-[#fff3b0] text-5xl font-bold mb-6'>FRIENDS & COMMUNITY</h1>
            <p className='text-[#a89060] text-xl'>Connect with friends and discover who's attending events near you.</p>
        </div>

        <div className='w-[82%] flex gap-6 mb-8'>
          <div className='w-1/3 space-y-6'>
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <h2 className='text-[#fff3b0] text-xl font-bold mb-4'>Your Friends</h2>
              <div className='space-y-3 max-h-72 overflow-y-auto'>
                {currentFriends.length === 0 ? (
                  <p className='text-[#a89060]'>No friends yet</p>
                ) : (
                  currentFriends.map((friend) => (
                    <div 
                      key={friend.name}
                      className='bg-[#2a1f20] border-2 border-[#483d30] hover:border-[#fff3b0] transition p-3 cursor-pointer'
                    >
                      <div className='flex gap-3 items-start mb-2'>
                        <img
                          src={friend.image}
                          alt={friend.name}
                          onClick={() => handleViewProfile(friend.name)}
                          className='w-12 h-12 object-cover border border-[#483d30] flex-shrink-0 hover:border-[#fff3b0] transition'
                        />
                        <div className='flex-1 min-w-0'>
                          <p 
                            onClick={() => handleViewProfile(friend.name)}
                            className='text-[#fff3b0] font-bold text-sm hover:underline cursor-pointer truncate'
                          >
                            {friend.name}
                          </p>
                          <p className='text-[#a89060] text-xs'>{friend.role}</p>
                          <p className='text-[#8b7355] text-xs'>{friend.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => setSelectedChat(friend.name)}
                          className='flex-1 border border-[#fff3b0] text-[#fff3b0] text-xs py-1 hover:bg-[#3d2d24] transition'
                        >
                          Message
                        </button>
                        <button
                          onClick={() => handleToggleFriend(friend.name)}
                          className='flex-1 border border-[#ff6b6b] text-[#ff6b6b] text-xs py-1 hover:bg-[#3d2d24] transition'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <h2 className='text-[#fff3b0] text-xl font-bold mb-4'>Recommended</h2>
              <div className='space-y-3 max-h-72 overflow-y-auto'>
                {recommendedFriends.length === 0 ? (
                  <p className='text-[#a89060] text-sm'>No recommendations available</p>
                ) : (
                  recommendedFriends.map((friend) => (
                    <div 
                      key={friend.name}
                      className='bg-[#2a1f20] border-2 border-[#483d30] hover:border-[#fff3b0] transition p-3 cursor-pointer'
                    >
                      <div className='flex gap-3 items-start mb-2'>
                        <img
                          src={friend.image}
                          alt={friend.name}
                          onClick={() => handleViewProfile(friend.name)}
                          className='w-12 h-12 object-cover border border-[#483d30] flex-shrink-0 hover:border-[#fff3b0] transition'
                        />
                        <div className='flex-1 min-w-0'>
                          <p 
                            onClick={() => handleViewProfile(friend.name)}
                            className='text-[#fff3b0] font-bold text-sm hover:underline cursor-pointer truncate'
                          >
                            {friend.name}
                          </p>
                          <p className='text-[#a89060] text-xs'>{friend.role}</p>
                          <p className='text-[#8b7355] text-xs'>{friend.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleFriend(friend.name)}
                        className='w-full border-2 border-[#fff3b0] text-[#fff3b0] text-xs py-1 hover:bg-[#2d1d14] transition'
                      >
                        Add Friend
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className='w-2/3 border-4 border-[#fff3b0] bg-[#1a0f10] p-6 flex flex-col '>
            <h2 className='text-[#fff3b0] text-2xl font-bold mb-4'>Messages</h2>
            
            {selectedChat ? (
              <div className='flex flex-col h-full mt-auto'>
                <div className='mb-4 pb-4 border-b border-[#483d30]'>
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className='text-[#a89060] hover:text-[#fff3b0] transition'
                  >
                    ← Back to friends
                  </button>
                  <h3 className='text-[#fff3b0] text-xl font-bold mt-2'>{selectedChat}</h3>
                </div>
                
                <div className='flex-1 overflow-y-auto mb-4 space-y-2'>
                  {chatMessages.length === 0 ? (
                    <p className='text-[#a89060] text-center mt-8'>No messages yet. Start a conversation!</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded ${msg.sender === 'user' ? 'bg-[#e3a63e]' : 'bg-[#483d30]'} text-[#1a0f10]`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className='flex gap-2'>
                  <input 
                    type='text'
                    placeholder='Type a message...'
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleSendMessage(selectedChat, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className='flex-1 px-3 py-2 bg-[#2a1f20] border border-[#a89060] text-[#fff3b0] placeholder-[#8b7355] focus:outline-none'
                  />
                  <button className='px-4 py-2 border-2 border-[#fff3b0] text-[#fff3b0] hover:bg-[#2d1d14] transition'>
                    Send
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
