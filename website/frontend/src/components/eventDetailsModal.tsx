import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from './event';
import { fetchFriendContacts, shareItemWithFriend, type FriendContact } from '../utils/community.ts';

type EventDetailsModalProps = {
  event: Event | null;
  onClose: () => void;
  onSeeOnMap?: (event: Event) => void;
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onSeeOnMap }) => {
  const navigate = useNavigate();
  const [friendContacts, setFriendContacts] = React.useState<FriendContact[]>([]);
  const [selectedFriendUsername, setSelectedFriendUsername] = React.useState('');

  React.useEffect(() => {
    void fetchFriendContacts().then((contacts) => {
      setFriendContacts(contacts);
      setSelectedFriendUsername((current) => current || contacts[0]?.username || '');
    });
  }, []);

  if (!event) {
    return null;
  }

  const handleShareToFriend = async () => {
    if (!selectedFriendUsername.trim()) {
      return;
    }

    await shareItemWithFriend({
      friendUsername: selectedFriendUsername.trim(),
      itemType: 'event',
      itemId: event.id ?? 0,
      title: event.title,
      url: `/events?eventId=${event.id ?? ''}`,
      body: event.description,
    });
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0506]/80 px-4 py-8 backdrop-blur-sm'>
      <div className='max-h-[88vh] w-full max-w-4xl overflow-y-auto border-4 border-[#fff3b0] bg-[#1a0f10] shadow-[0_20px_80px_rgba(0,0,0,0.55)]'>
        <div className='relative'>
          <img src={event.src} alt={event.alt} className='h-72 w-full object-cover' />
          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0506] to-transparent px-6 py-5'>
            <span className='inline-flex border border-[#fff3b0] bg-[#1a0f10]/80 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>
              {event.type}
            </span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='absolute right-4 top-4 h-10 w-10 border border-[#fff3b0] bg-[#1a0f10]/80 text-xl font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10]'
            aria-label='Close event details'
          >
            ×
          </button>
        </div>

        <div className='space-y-5 px-6 py-6'>
          <div className='space-y-2'>
            <h2 className='text-4xl font-bold text-[#fff3b0]'>{event.title}</h2>
            <p className='text-xl text-[#a89060]'>{event.promoter}</p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Location</p>
              <p className='mt-2 text-lg'>{event.location}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Schedule</p>
              <p className='mt-2 text-lg'>{event.date} {event.time}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Attendance</p>
              <p className='mt-2 text-lg'>{event.attending}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Price</p>
              <p className='mt-2 text-lg'>{event.price}</p>
            </div>
          </div>

          <p className='leading-8 text-[#f1e2ba]'>{event.description}</p>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <button
              type='button'
              onClick={() => {
                if (onSeeOnMap) {
                  onSeeOnMap(event);
                  return;
                }

                navigate(`/map?eventId=${event.id ?? ''}`);
              }}
              className='border-2 border-[#fff3b0] bg-[#fff3b0] px-5 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0]'
            >
              See on Map
            </button>
            {event.ticketLink ? (
              <a
                href={event.ticketLink}
                target='_blank'
                rel='noreferrer'
                className='border-2 border-[#483d30] px-5 py-3 text-center font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'
              >
                Buy Tickets
              </a>
            ) : null}
            <div className='flex flex-1 flex-col gap-3 rounded-none border-2 border-[#483d30] bg-[#120707] p-3 sm:max-w-sm'>
              <label className='text-sm font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>Share to friend</label>
              <select
                value={selectedFriendUsername}
                onChange={(event) => setSelectedFriendUsername(event.target.value)}
                className='border border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] outline-none focus:border-[#fff3b0]'
              >
                {friendContacts.length === 0 ? (
                  <option value=''>No friends available</option>
                ) : (
                  friendContacts.map((friend) => (
                    <option key={friend.username} value={friend.username}>
                      {friend.name} (@{friend.username})
                    </option>
                  ))
                )}
              </select>
              <button
                type='button'
                onClick={() => void handleShareToFriend()}
                disabled={!selectedFriendUsername}
                className='border-2 border-[#fff3b0] px-5 py-3 font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10] disabled:cursor-not-allowed disabled:border-[#483d30] disabled:text-[#483d30]'
              >
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;