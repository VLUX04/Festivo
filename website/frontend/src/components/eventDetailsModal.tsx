import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from './event';

const actionButtonClass = 'min-w-[170px] border-2 border-[#fff3b0] px-5 py-3 font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10] disabled:cursor-not-allowed disabled:border-[#483d30] disabled:text-[#483d30]';

type EventDetailsModalProps = {
  event: Event | null;
  onClose: () => void;
  onSeeOnMap?: (event: Event) => void;
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onSeeOnMap }) => {
  const navigate = useNavigate();

  if (!event) {
    return null;
  }

  const handleTicketClick = () => {
    if (event.ticketLink) {
      window.open(event.ticketLink, '_blank', 'noreferrer');
      return;
    }

    window.alert('Ticket link not available for this event yet.');
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
            <button
              type='button'
              onClick={() => {
                if (!event.promoterUsername) {
                  return;
                }

                navigate(`/profile/${event.promoterUsername}`);
              }}
              className='text-left text-xl text-[#a89060] transition hover:text-[#fff3b0]'
            >
              {event.promoter}
            </button>
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

          <div className='space-y-4 border-t border-[#483d30] pt-5'>
            <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
              <button
                type='button'
                onClick={() => {
                  if (onSeeOnMap) {
                    onSeeOnMap(event);
                    return;
                  }

                  navigate(`/map?eventId=${event.id ?? ''}`);
                }}
                className={`${actionButtonClass} bg-transparent`}
              >
                See on Map
              </button>
              <button
                type='button'
                onClick={handleTicketClick}
                className={`${actionButtonClass} bg-transparent`}
              >
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;