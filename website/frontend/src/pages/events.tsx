import React from 'react';
import PageLayout from '../components/pageLayout'
import EventContainer from '../components/event'
import HighlightedEventCard from '../components/highlightedEvent.tsx'
import brownCalendarIcon from '../icons/brown-calendar.png';
import { eventsTempData } from '../data/eventsTempData'

const highlightedEvents = eventsTempData.slice(0, 2);

const EventsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='mx-auto flex w-[82%] flex-col gap-8'>
          <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
            <h1 className='mb-6 text-5xl font-bold text-[#fff3b0]'>DISCOVER EVENTS</h1>
            <p className='text-xl text-[#a89060]'>
              Find cultural experiences, concerts, exhibitions, and gatherings happening around you.
            </p>
          </div>

          <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
            <div className='mb-8 flex items-start gap-4'>
              <div className='flex h-20 w-20 shrink-0 rotate-4 items-center justify-center border-[4px] border-[#fff3b0] bg-[#e3a63e] shadow-[6px_6px_0_0_rgba(106,28,20,0.55)]'>
                <img className='h-10 w-10 object-contain' src={brownCalendarIcon} alt='Event Highlight' />
              </div>
              <div className='pt-1'>
                <h2 className='text-4xl font-black uppercase tracking-tight text-[#fff3b0] sm:text-2xl'>Event Highlights</h2>
                <p className='mt-2 max-w-2xl text-[#a89060] text-lg'>
                  Featured events with high engagement from your friends.
                </p>
              </div>
            </div>

            <div className='grid gap-8 xl:grid-cols-2'>
              {highlightedEvents.map((event) => (
                <HighlightedEventCard key={`${event.title}-${event.date}`} event={event} />
              ))}
            </div>
          </div>

          <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
            {eventsTempData.map((event) => (
              <EventContainer key={`${event.title}-${event.date}`} event={event} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventsPage;