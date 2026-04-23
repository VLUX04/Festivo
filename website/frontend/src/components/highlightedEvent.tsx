import React from 'react';
import type { Event } from './event';
import mapIcon from '../icons/map.png';
import eventsIcon from '../icons/events.png';
import friendsIcon from '../icons/friends.png';
import priceIcon from '../icons/price.png';

const HighlightedEventCard: React.FC<{ event: Event }> = ({ event }) => (
  <article className='group grid overflow-hidden border-[4px] border-[#fff3b0] bg-[#120707] text-[#fff3b0] lg:grid-cols-2'>
    <div className='relative min-h-[360px] overflow-hidden lg:min-h-[520px]'>
      <img src={event.src} alt={event.alt} className='h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105' />
      <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0506] via-[#0d0506]/75 to-transparent p-4 lg:p-5'>
        <div className='inline-flex items-center gap-3 border border-[#fff3b0] bg-[#2a1713]/85 px-3 py-2 backdrop-blur-sm'>
          <div className='flex -space-x-3'>
            {event.friendsGoing.slice(0, 3).map((friendAvatar, index) => (
              <img
                key={`${friendAvatar}-${index}`}
                src={friendAvatar}
                alt=''
                className='h-9 w-9 rounded-full border-2 border-[#2a1713] object-cover'
                aria-hidden='true'
              />
            ))}
          </div>
          <span className='text-sm font-bold text-[#fff3b0] sm:text-base'>{event.friendsGoing.length} friends going</span>
        </div>
      </div>
    </div>

    <div className='flex flex-col gap-4 px-6 py-7'>
      <div className='flex items-start justify-between gap-4'>
        <span className='border border-[#fff3b0] px-3 py-1 text-sm font-semibold text-[#fff3b0]'>{event.type}</span>
        <span className='pointer-events-none rotate-4 border-2 border-[#e3a63e] bg-[#e3a63e] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#6a1c14] shadow-[0_4px_0_0_rgba(106,28,20,0.5)] transition duration-300 ease-out group-hover:rotate-0'>
          Highlight
        </span>
      </div>

      <div className='space-y-3'>
        <h2 className='text-xl font-extrabold leading-[1.05] text-[#fff3b0]'>
          {event.title}
        </h2>
        <p className='text-sm text-[#fff3b0]'>{event.promoter}</p>
        <p className='leading-7 text-[#a89060]'>{event.description}</p>
      </div>

      <div className='space-y-3 font-semibold text-[#fff3b0]'>
        <div className='flex items-start gap-3'>
          <img src={mapIcon} alt='' className='mt-1 h-5 w-5 object-contain' aria-hidden='true' />
          <span>{event.location}</span>
        </div>
        <div className='flex items-start gap-3'>
          <img src={eventsIcon} alt='' className='mt-1 h-5 w-5 object-contain' aria-hidden='true' />
          <span>{event.date} • {event.time}</span>
        </div>
        <div className='flex items-start gap-3'>
          <img src={friendsIcon} alt='' className='mt-1 h-5 w-5 object-contain' aria-hidden='true' />
          <span>{event.attending}</span>
        </div>
        <div className='flex items-start gap-3'>
          <img src={priceIcon} alt='' className='mt-1 h-5 w-5 object-contain' aria-hidden='true' />
          <span>{event.price}</span>
        </div>
      </div>

      <div className='mt-auto'>
        <button className=' w-full transition duration-300 ease-in-out text-[#fff3b0] p-2 mb-6 border border-[#483d30] hover:bg-[#fff3b0] hover:border-[#fff3b0] hover:text-[#1a0f10]'>
          View Details
        </button>
      </div>
    </div>
  </article>
);

export default HighlightedEventCard;