import React, { useMemo, useState } from 'react';
import PageLayout from '../components/pageLayout'
import EventContainer from '../components/event'
import HighlightedEventCard from '../components/highlightedEvent.tsx'
import EventDetailsModal from '../components/eventDetailsModal';
import brownCalendarIcon from '../icons/brown-calendar.png';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, fetchRecommendedEvents } from '../utils/events.ts';
import { getStoredUser } from '../utils/auth.ts';

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ready' | 'denied'>('idle');
  const [events, setEvents] = useState<React.ComponentProps<typeof EventContainer>['event'][]>([]);
  const [selectedEvent, setSelectedEvent] = useState<React.ComponentProps<typeof EventContainer>['event'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = getStoredUser();
  const [recommendedEvents, setRecommendedEvents] = useState<React.ComponentProps<typeof EventContainer>['event'][]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const loadedEvents = await fetchEvents();

        if (isMounted) {
          setEvents(loadedEvents);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      if (user?.id) {
        const recommended = await fetchRecommendedEvents(user.id);
        if (isMounted) setRecommendedEvents(recommended);
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('denied'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ready');
        setSortBy('proximity-asc');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 },
    );
  };

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const classifyEvent = React.useCallback((event: React.ComponentProps<typeof EventContainer>['event']): 'past' | 'ongoing' | 'upcoming' => {
    const start = event.rawDate || '';
    const end = event.rawEdate || start;
    if (end < today) return 'past';
    if (start <= today && end >= today) return 'ongoing';
    return 'upcoming';
  }, [today]);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !eventType || event.type.toLowerCase() === eventType.toLowerCase();
      const matchesLocation = !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());
      const rawDate = event.rawDate || '';
      const matchesFrom = !dateFrom || rawDate >= dateFrom;
      const matchesTo = !dateTo || rawDate <= dateTo;
      return matchesSearch && matchesType && matchesLocation && matchesFrom && matchesTo;
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
        case 'proximity-asc': {
          if (!userCoords) return 0;
          const distA = (a.latitude != null && a.longitude != null)
            ? haversineKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude)
            : Infinity;
          const distB = (b.latitude != null && b.longitude != null)
            ? haversineKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
            : Infinity;
          return distA - distB;
        }
        default:
          return 0;
      }
    });
  }, [events, searchQuery, eventType, sortBy, locationFilter, dateFrom, dateTo, userCoords]);

  const ongoingEvents  = useMemo(() => filteredAndSortedEvents.filter((e) => classifyEvent(e) === 'ongoing'),         [filteredAndSortedEvents, classifyEvent]);
  const upcomingEvents = useMemo(() => filteredAndSortedEvents.filter((e) => classifyEvent(e) === 'upcoming'),        [filteredAndSortedEvents, classifyEvent]);
  const pastEvents     = useMemo(() => [...filteredAndSortedEvents.filter((e) => classifyEvent(e) === 'past')].reverse(), [filteredAndSortedEvents, classifyEvent]);

  const highlightedEvents = filteredAndSortedEvents.slice(0, 2);

  const distanceLabel = (event: React.ComponentProps<typeof EventContainer>['event']): string | null => {
    if (sortBy !== 'proximity-asc' || !userCoords || event.latitude == null || event.longitude == null) return null;
    const km = haversineKm(userCoords.lat, userCoords.lng, event.latitude, event.longitude);
    if (km < 1) return '< 1 km';
    if (km < 1000) return `${Math.round(km)} km`;
    return `${(km / 1000).toFixed(1)}k km`;
  };

  const EventWithDistance = ({ event, keyPrefix }: { event: React.ComponentProps<typeof EventContainer>['event']; keyPrefix: string }) => {
    const dist = distanceLabel(event);
    return (
      <div key={`${keyPrefix}-${event.id}`} className='relative'>
        <EventContainer event={event} onViewDetails={handleViewDetails} />
        {dist ? (
          <span className='absolute top-3 left-3 bg-[#1a0f10]/90 border border-[#4caf50] text-[#4caf50] text-xs px-2 py-0.5 font-semibold z-10'>
            📍 {dist}
          </span>
        ) : null}
      </div>
    );
  };

  const handleViewDetails = (event: React.ComponentProps<typeof EventContainer>['event']) => {
    setSelectedEvent(event);
  };

  const handleSeeOnMap = (event: React.ComponentProps<typeof EventContainer>['event']) => {
    navigate(`/map?eventId=${event.id ?? ''}`);
  };

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
                <HighlightedEventCard key={`${event.title}-${event.date}`} event={event} onViewDetails={handleViewDetails} />
              ))}
            </div>
          </div>

            {user?.role === 'customer' && recommendedEvents.length > 0 && (
                <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
                    <div className='mb-8 flex items-start gap-4'>
                        <div className='pt-1'>
                            <h2 className='text-4xl font-black uppercase tracking-tight text-[#fff3b0]'>
                                Recommended For You
                            </h2>
                            <p className='mt-2 max-w-2xl text-[#a89060] text-lg'>
                                Events matching your preferences.
                            </p>
                        </div>
                    </div>
                    <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
                        {recommendedEvents.map((event) => (
                          <EventContainer key={`rec-${event.title}-${event.date}`} event={event} onViewDetails={handleViewDetails} />
                        ))}
                    </div>
                </div>
            )}

          {loading && (
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8 text-[#fff3b0]'>
              Loading events from the database...
            </div>
          )}

          {error && (
            <div className='border-4 border-[#ff6b6b] bg-[#1a0f10] p-8 text-[#ffb3b3]'>
              {error}
            </div>
          )}

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
                <div className='flex gap-2'>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className='flex-1 px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] focus:outline-none focus:border-[#fff3b0] transition cursor-pointer'>
                    <option value=''>Select sorting</option>
                    <option value='name-asc'>Name (A-Z)</option>
                    <option value='name-desc'>Name (Z-A)</option>
                    <option value='time-asc'>Time to Event (Soonest)</option>
                    <option value='time-desc'>Time to Event (Latest)</option>
                    <option value='people-asc'>People Going (Least)</option>
                    <option value='people-desc'>People Going (Most)</option>
                    {geoStatus === 'ready' && (
                      <option value='proximity-asc'>Nearest to Me</option>
                    )}
                  </select>
                  <button
                    type='button'
                    onClick={requestUserLocation}
                    disabled={geoStatus === 'loading'}
                    title={
                      geoStatus === 'denied' ? 'Location access denied' :
                      geoStatus === 'ready'  ? `Location active — click to refresh` :
                      'Sort by proximity to your location'
                    }
                    className={`shrink-0 px-3 py-3 border-2 text-sm transition
                      ${geoStatus === 'ready'   ? 'border-[#4caf50] text-[#4caf50] hover:bg-[#4caf50]/10' :
                        geoStatus === 'denied'  ? 'border-[#ff6b6b] text-[#ff6b6b] cursor-not-allowed opacity-60' :
                        geoStatus === 'loading' ? 'border-[#a89060] text-[#a89060] cursor-wait' :
                        'border-[#a89060] text-[#a89060] hover:border-[#fff3b0] hover:text-[#fff3b0]'}`}
                  >
                    {geoStatus === 'loading' ? '…' : '📍'}
                  </button>
                </div>
                {geoStatus === 'denied' && (
                  <p className='mt-1 text-xs text-[#ff6b6b]'>Location access was denied by the browser.</p>
                )}
                {geoStatus === 'ready' && (
                  <p className='mt-1 text-xs text-[#4caf50]'>Sorting by distance from your location.</p>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-6 mt-4'>
              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>Filter by Location</label>
                <input
                  type='text'
                  placeholder='City, venue name...'
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] placeholder-[#8b7355] focus:outline-none focus:border-[#fff3b0] transition'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>From Date</label>
                <input
                  type='date'
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] focus:outline-none focus:border-[#fff3b0] transition'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-semibold text-[#fff3b0] mb-2'>To Date</label>
                <input
                  type='date'
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className='w-full px-4 py-3 bg-[#2a1f20] border-2 border-[#a89060] text-[#fff3b0] focus:outline-none focus:border-[#fff3b0] transition'
                />
              </div>
            </div>
          </div>

          {/* HAPPENING NOW */}
          {ongoingEvents.length > 0 && (
            <div className='border-4 border-[#e09f3e] bg-[#1a0f10] p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <span className='inline-block h-3 w-3 rounded-full bg-[#e09f3e] animate-pulse' />
                <h2 className='text-3xl font-bold text-[#e09f3e] uppercase tracking-wider'>Happening Now</h2>
                <span className='text-sm text-[#a89060] border border-[#e09f3e] px-2 py-0.5'>{ongoingEvents.length} event{ongoingEvents.length !== 1 ? 's' : ''}</span>
              </div>
              <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
                {ongoingEvents.map((event) => (
                  <EventWithDistance key={`ongoing-${event.id}`} event={event} keyPrefix='ongoing' />
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING */}
          {upcomingEvents.length > 0 && (
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <h2 className='text-3xl font-bold text-[#fff3b0] uppercase tracking-wider'>Upcoming Events</h2>
                <span className='text-sm text-[#a89060] border border-[#fff3b0] px-2 py-0.5'>{upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}</span>
              </div>
              <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
                {upcomingEvents.map((event) => (
                  <EventWithDistance key={`upcoming-${event.id}`} event={event} keyPrefix='upcoming' />
                ))}
              </div>
            </div>
          )}

          {/* PAST */}
          {pastEvents.length > 0 && (
            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-8 mb-7'>
              <div className='flex items-center gap-3 mb-6'>
                <h2 className='text-3xl font-bold text-[#a89060] uppercase tracking-wider'>Past Events</h2>
                <span className='text-sm text-[#8b7355] border border-[#483d30] px-2 py-0.5'>{pastEvents.length} event{pastEvents.length !== 1 ? 's' : ''}</span>
              </div>
              <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3 opacity-70'>
                {pastEvents.map((event) => (
                  <EventWithDistance key={`past-${event.id}`} event={event} keyPrefix='past' />
                ))}
              </div>
            </div>
          )}

          {!loading && filteredAndSortedEvents.length === 0 && (
            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-8 text-[#a89060]'>
              No events match your filters.
            </div>
          )}
        </div>
      </div>
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSeeOnMap={handleSeeOnMap}
      />
    </PageLayout>
  );
};

export default EventsPage;
