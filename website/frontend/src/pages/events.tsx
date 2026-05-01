import React, { useState, useMemo } from 'react';
import PageLayout from '../components/pageLayout'
import EventContainer from '../components/event'
import HighlightedEventCard from '../components/highlightedEvent.tsx'
import brownCalendarIcon from '../icons/brown-calendar.png';
import { eventsTempData } from '../data/eventsTempData'

const highlightedEvents = eventsTempData.slice(0, 2);

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [sortBy, setSortBy] = useState('');

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = eventsTempData.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !eventType || event.type.toLowerCase() === eventType.toLowerCase();
      return matchesSearch && matchesType;
    });

    if (!sortBy) return filtered;

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'time-asc': {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        }
        case 'time-desc': {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        }
        case 'people-asc': {
          const aCount = parseInt(a.attending.match(/\d+/)?.[0] || '0');
          const bCount = parseInt(b.attending.match(/\d+/)?.[0] || '0');
          return aCount - bCount;
        }
        case 'people-desc': {
          const aCount = parseInt(a.attending.match(/\d+/)?.[0] || '0');
          const bCount = parseInt(b.attending.match(/\d+/)?.[0] || '0');
          return bCount - aCount;
        }
        default:
          return 0;
      }
    });
  }, [searchQuery, eventType, sortBy]);

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

          <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
            <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-6'>
              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>Search Events</label>
                <input
                  type='text'
                  placeholder='Search by event name...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] placeholder-[#8b7355] focus:outline-none focus:border-[#fff3b0] transition'
                />
              </div>

              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>Event Type</label>
                <select 
                  value={eventType} 
                  onChange={(e) => setEventType(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] focus:outline-none focus:border-[#fff3b0] transition cursor-pointer'>
                  <option value=''>All Types</option>
                  <option value='music'>Music</option>
                  <option value='food'>Food</option>
                  <option value='live'>Live</option>
                  <option value='jazz'>Jazz</option>
                  <option value='nightlife'>Nightlife</option>
                  <option value='cinema'>Cinema</option>
                </select>
              </div>

              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] focus:outline-none focus:border-[#fff3b0] transition cursor-pointer'>
                  <option value=''>Select sorting</option>
                  <option value='name-asc'>Name (A-Z)</option>
                  <option value='name-desc'>Name (Z-A)</option>
                  <option value='time-asc'>Time to Event (Soonest)</option>
                  <option value='time-desc'>Time to Event (Latest)</option>
                  <option value='people-asc'>People Going (Least)</option>
                  <option value='people-desc'>People Going (Most)</option>
                </select>
              </div>
            </div>
          </div>

          <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3 mb-7'>
            {filteredAndSortedEvents.map((event) => (
              <EventContainer key={`${event.title}-${event.date}`} event={event} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventsPage;