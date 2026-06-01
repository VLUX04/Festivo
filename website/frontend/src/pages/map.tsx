import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import EventDetailsModal from '../components/eventDetailsModal';
import type { Event } from '../components/event';
import { fetchEvents } from '../utils/events';

// Leaflet icon setup
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultIcon = new L.Icon.Default();
const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface ChangeViewProps {
    center: [number, number];
    zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
    map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
}

const MapPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<Event | null>(null);
  const [zoom, setZoom] = useState(5);
  const defaultCenter: [number, number] = [41.1579, -8.6291];
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setError('');
        const loadedEvents = await fetchEvents();
        if (isMounted) {
          setEvents(loadedEvents);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load events');
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const selectedId = searchParams.get('eventId');

    if (!selectedId) {
      return;
    }

    const matchedEvent = events.find((event) => String(event.id ?? '') === selectedId);

    if (matchedEvent) {
      setSelectedEvent(matchedEvent);
      setZoom(13);
    }
  }, [events, searchParams]);

  const eventsWithCoords = events.filter((event) =>
    typeof event.latitude === 'number' && typeof event.longitude === 'number',
  );

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setZoom(13);
    setSearchParams({ eventId: String(event.id ?? '') });
  }

  const selectedMapEvent = selectedEvent;

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='mx-auto flex w-[82%] flex-col gap-8'>
          <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-8 mb-8'>
            <h1 className='mb-6 text-5xl font-bold text-[#fff3b0]'>EVENTS MAP</h1>
            <p className='text-xl text-[#a89060]'>
              Explore events close to you in an interactive map
            </p>
          </div>

          <div className="flex gap-8 items-stretch mb-10">
            <div className="w-[70%]">
              <div className="aspect-[4/3] border-4 border-[#fff3b0] bg-[#1a0f10] p-4">
                <MapContainer
                  center={selectedEvent && selectedEvent.latitude !== undefined && selectedEvent.longitude !== undefined
                    ? [selectedEvent.latitude, selectedEvent.longitude]
                    : defaultCenter}
                  zoom={zoom}
                  className="h-full w-full rounded-lg"
                >
                  {selectedMapEvent && selectedMapEvent.latitude !== undefined && selectedMapEvent.longitude !== undefined ? (
                    <ChangeView center={[selectedMapEvent.latitude, selectedMapEvent.longitude]} zoom={zoom} />
                  ) : null}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {eventsWithCoords.map((event) => (
                    <Marker 
                      key={`${event.title}-${event.date}`}
                      position={[event.latitude as number, event.longitude as number]}
                      icon={selectedEvent && event.title === selectedEvent.title ? orangeIcon : defaultIcon}
                    >
                      <Popup>
                        <strong>{event.title}</strong><br />
                        {event.date}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="w-[30%] aspect-square">
              <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6 h-full flex flex-col'>
                <h2 className="text-3xl font-bold mb-4 text-[#fff3b0]">Events List</h2>
                <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  {error && (
                    <div className="border-2 border-[#ff6b6b] rounded-lg p-4 bg-[#2a1f20] text-[#ffb3b3]">
                      {error}
                    </div>
                  )}
                  {eventsWithCoords.length === 0 ? (
                    <div className="border-2 border-[#a89060] rounded-lg p-4 bg-[#2a1f20] text-[#a89060]">
                      No events available yet.
                    </div>
                  ) : (
                    eventsWithCoords.map((event) => (
                      <div key={`${event.title}-${event.date}`} className="border-2 border-[#a89060] rounded-lg p-4 bg-[#2a1f20]">
                        <h3 className="text-xl font-bold text-[#fff3b0]">{event.title}</h3>
                        <p className="text-[#a89060]">{event.date}</p>
                        <p className="text-[#a89060]">{event.location}</p>
                        <div className="flex mt-4 space-x-2">
                          <button
                            onClick={() => handleSelectEvent(event)}
                            className="bg-[#e3a63e] text-[#1a0f10] px-4 py-2 rounded-lg font-bold"
                          >
                            See on Map
                          </button>
                          <button
                            onClick={() => setDetailsEvent(event)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                          >
                            See Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedEvent ? (
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center'>
                <div className='h-28 w-40 overflow-hidden border-2 border-[#483d30] bg-[#120707]'>
                  <img src={selectedEvent.src} alt={selectedEvent.alt} className='h-full w-full object-cover' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-3xl font-bold text-[#fff3b0]'>{selectedEvent.title}</h3>
                  <p className='text-[#a89060]'>{selectedEvent.promoter}</p>
                  <p className='text-[#a89060]'>{selectedEvent.location}</p>
                  <p className='text-[#a89060]'>{selectedEvent.date} {selectedEvent.time}</p>
                </div>
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setDetailsEvent(selectedEvent)}
                    className='border-2 border-[#fff3b0] bg-[#fff3b0] px-5 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0]'
                  >
                    See Details
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <EventDetailsModal
        event={detailsEvent}
        onClose={() => setDetailsEvent(null)}
        onSeeOnMap={handleSelectEvent}
      />
    </PageLayout>
  );
};

export default MapPage;