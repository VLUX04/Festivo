import '../style.css'
import React from 'react';

export interface Event {
    src: string,
    alt: string,
    date: string,
    title: string,
    description: string,
    location: string,
    time: string,
    price: string,
}

const EventContainer: React.FC<{ event: Event }> = ({ event }) => (
    <div className='transition duration-300 ease-in-out flex flex-col space-y-2 bg-[#1a0f10] border border-[#483d30] hover:border-[#fff3b0] w-full text-left'>
            <img src={event.src} alt={event.alt} />
            <h1 className='text-[#fff3b0] px-6 text-2xl'>{event.title}</h1>
            <p className='text-[#a89060] px-6'>{event.description}</p>
            <span className='text-[#a89060] px-6'>{event.location}</span>
            <span className='text-[#a89060] px-6'>{event.date} {event.time}</span>
            <span className='text-[#a89060] px-6'>{event.price}</span>
            <button className='transition duration-300 ease-in-out text-[#fff3b0] p-4 mx-6 mb-6 border border-[#483d30] hover:bg-[#fff3b0] hover:border-[#fff3b0] hover:text-[#1a0f10]'>View Details</button>
    </div>
)

export default EventContainer