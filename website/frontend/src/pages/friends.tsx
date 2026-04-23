import React from 'react';
import PageLayout from '../components/pageLayout'
import { friendsTempData } from '../data/friendsTempData'

const FriendsPage: React.FC = () => {
  const [friends, setFriends] = React.useState(friendsTempData)

  const handleToggleFriend = (name: string) => {
    setFriends((previousFriends) =>
      previousFriends.map((friend) =>
        friend.name === name ? { ...friend, isFriend: !friend.isFriend } : friend,
      ),
    )
  }

  const currentFriends = friends.filter((friend) => friend.isFriend)
  const notFriends = friends.filter((friend) => !friend.isFriend)

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
            <h1 className='text-[#fff3b0] text-5xl font-bold mb-6'>FRIENDS & COMMUNITY</h1>
            <p className='text-[#a89060] text-xl'>Connect with friends and discover who's attending events near you.</p>
        </div>
        <div className='w-[82%] space-y-8 mt-6'>
          <section>
            <h2 className='text-[#fff3b0] text-3xl font-bold mb-4'>Friends</h2>
            <div className='grid grid-cols-3 gap-6'>
              {currentFriends.map((friend) => (
                <div key={friend.name} className='bg-[#1a0f10] border-2 border-[#483d30] hover:border-[#fff3b0] transition duration-333 ease-in-out p-5 flex gap-4 items-start'>
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className='w-[100px] h-[100px] object-cover border-2 border-[#483d30] flex-shrink-0'
                  />
                  <div className='flex flex-col'>
                    <h3 className='text-2xl text-[#fff3b0] font-bold'>{friend.name}</h3>
                    <p className='text-[#a89060] mt-2'>Mutual friends: {friend.mutualFriends}</p>
                    <p className='text-[#a89060] mt-1'>Status: Friend</p>
                    <button
                      className='mt-4 border-2 border-[#fff3b0] text-[#fff3b0] px-4 py-2 hover:bg-[#2d1d14] transition duration-333 ease-in-out self-start'
                      onClick={() => handleToggleFriend(friend.name)}
                    >
                      Unadd Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className='text-[#fff3b0] text-3xl font-bold mb-4'>Not Friends</h2>
            <div className='grid grid-cols-3 gap-6'>
              {notFriends.map((friend) => (
                <div key={friend.name} className='bg-[#1a0f10] border-2 border-[#483d30] hover:border-[#fff3b0] transition duration-333 ease-in-out p-5 flex gap-4 items-start'>
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className='w-[100px] h-[100px] object-cover border-2 border-[#483d30] flex-shrink-0'
                  />
                  <div className='flex flex-col'>
                    <h3 className='text-2xl text-[#fff3b0] font-bold'>{friend.name}</h3>
                    <p className='text-[#a89060] mt-2'>Mutual friends: {friend.mutualFriends}</p>
                    <p className='text-[#a89060] mt-1'>Status: Not Friend</p>
                    <button
                      className='mt-4 border-2 border-[#fff3b0] text-[#fff3b0] px-4 py-2 hover:bg-[#2d1d14] transition duration-333 ease-in-out self-start'
                      onClick={() => handleToggleFriend(friend.name)}
                    >
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </div>
        </div>
    </PageLayout>
  );
};

export default FriendsPage;
