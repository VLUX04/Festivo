import React from 'react';
import PageLayout from '../components/pageLayout'
import EventContainer from '../components/event'
import { eventsTempData } from '../data/eventsTempData'

const EventsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className='p-4 space-y-6 flex flex-col items-center'>
        <div className='w-[82%] bg-[#1a0f10] border-3 border-[#fff3b0] p-6'>
            <h1 className='text-[#fff3b0] text-5xl font-bold mb-6'>DISCOVER EVENTS</h1>
            <p className='text-[#a89060] text-xl'>Find cultural experiences, concerts, exhibitions, and gatherings happening around you.</p>
        </div>
        <div className='grid grid-cols-3 gap-10 w-[82%]'>
          {eventsTempData.map((event) => (
            <EventContainer key={`${event.title}-${event.date}`} event={event} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default EventsPage;