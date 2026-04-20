import '../style.css'
import React from 'react';
import mapIcon from '../icons/map.png';
import eventsIcon from '../icons/events.png';
import friendsIcon from '../icons/friends.png';
import priceIcon from '../icons/price.png';
import shareIcon from '../icons/share.png';
import shareDarkIcon from '../icons/share-dark.png';

export interface Event {
    src: string,
    alt: string,
    type: string,
    date: string,
    title: string,
    description: string,
    location: string,
    time: string,
    attending: string,
    friendsGoing: string[],
    price: string,
}

const EventContainer: React.FC<{ event: Event }> = ({ event }) => (
    <div className='transition duration-300 ease-in-out flex flex-col space-y-2 bg-[#1a0f10] border-3 border-[#483d30] hover:border-[#fff3b0] w-full text-left'>
            <div className='relative'>
                <img src={event.src} alt={event.alt} className='w-full object-cover' />
                <div className='absolute right-4 top-4 z-10 flex items-center gap-2'>
                    <span className='border border-[#fff3b0] bg-[#e09f3e]/80 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>
                        {event.type}
                    </span>
                    <button type='button' aria-label={`Share ${event.title}`} className='group flex h-8 w-8 items-center justify-center border border-[#fff3b0] bg-[#1a0f10]/80 text-[#fff3b0] transition duration-300 ease-in-out hover:bg-[#fff3b0] hover:text-[#1a0f10]'>
                        <img src={shareIcon} alt="Share" className='h-5 w-5 group-hover:hidden' />
                        <img src={shareDarkIcon} alt="" className='hidden h-5 w-5 group-hover:block' aria-hidden='true' />
                    </button>
                </div>
                <div className='absolute bottom-4 left-4 z-10 flex items-center -space-x-2'>
                    {event.friendsGoing.slice(0, 3).map((friendAvatar, index) => (
                        <img
                            key={`${friendAvatar}-${index}`}
                            src={friendAvatar}
                            alt=''
                            className='h-9 w-9 rounded-full border-2 border-[#1a0f10] object-cover'
                            aria-hidden='true'
                        />
                    ))}
                </div>
            </div>
            <h1 className='text-[#fff3b0] px-6 text-2xl'>{event.title}</h1>
            <p className='text-[#a89060] px-6'>{event.description}</p>
            <div className='flex items-center'>
                <img src={mapIcon} alt="" className='ml-6 mr-2 h-5 w-5 object-contain group-active:mix-blend-color' aria-hidden='true' />
                <span className='text-[#a89060] pr-6'>{event.location}</span>
            </div>
            <div className='flex items-center'>
                <img src={eventsIcon} alt="" className='ml-6 mr-2 h-5 w-5 object-contain group-active:mix-blend-color' aria-hidden='true' />
                <span className='text-[#a89060] pr-6'>{event.date} {event.time}</span>
            </div>
            <div className='flex items-center'>
                <img src={friendsIcon} alt="" className='ml-6 mr-2 h-5 w-5 object-contain group-active:mix-blend-color' aria-hidden='true' />
                <span className='text-[#a89060] pr-6'>{event.attending}</span>
            </div>
            <div className='flex items-center'>
                <img src={priceIcon} alt="" className='ml-6 mr-2 h-5 w-5 object-contain group-active:mix-blend-color' aria-hidden='true' />
                <span className='text-[#a89060] pr-6'>{event.price}</span>
            </div>
            
            <button className='transition duration-300 ease-in-out text-[#fff3b0] p-2 mx-6 mb-6 border border-[#483d30] hover:bg-[#fff3b0] hover:border-[#fff3b0] hover:text-[#1a0f10]'>View Details</button>
    </div>
)

export default EventContainer