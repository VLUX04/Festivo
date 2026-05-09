import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import PageLayout from '../components/pageLayout';

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

const events = [
  {
    id: 1,
    name: "Porto Music Fest",
    date: "2026-06-15",
    description: "A vibrant music festival celebrating local and international artists along the Douro riverfront.",
    location: { city: "Porto", country: "Portugal", lat: 41.1579, lng: -8.6291 },
  },
  {
    id: 2,
    name: "Lisbon Tech Summit",
    date: "2026-07-03",
    description: "Annual gathering of tech innovators, startups, and investors shaping the future of Europe's tech scene.",
    location: { city: "Lisbon", country: "Portugal", lat: 38.7169, lng: -9.1395 },
  },
  {
    id: 3,
    name: "Madrid Street Food Fair",
    date: "2026-07-20",
    description: "A weekend-long outdoor fair showcasing street food from over 30 countries in the heart of Madrid.",
    location: { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  },
  {
    id: 4,
    name: "Paris Art & Culture Week",
    date: "2026-08-10",
    description: "A celebration of contemporary art, photography, and sculpture across iconic Parisian venues.",
    location: { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  },
  {
    id: 5,
    name: "Berlin Electronic Festival",
    date: "2026-09-05",
    description: "Three days of non-stop electronic music across multiple stages in Berlin's warehouse district.",
    location: { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  },
];

interface ChangeViewProps {
    center: [number, number];
    zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }, [center, zoom, map]);
    return null;
}

const MapPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [zoom, setZoom] = useState(5);

  const handleSelectEvent = (event: typeof events[0]) => {
    setSelectedEvent(event);
    setZoom(13);
  }

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
                  center={[selectedEvent.location.lat, selectedEvent.location.lng]}
                  zoom={zoom}
                  className="h-full w-full rounded-lg"
                >
                  <ChangeView center={[selectedEvent.location.lat, selectedEvent.location.lng]} zoom={zoom} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {events.map((event) => (
                    <Marker 
                      key={event.id} 
                      position={[event.location.lat, event.location.lng]}
                      icon={event.id === selectedEvent.id ? orangeIcon : defaultIcon}
                    >
                      <Popup>
                        <strong>{event.name}</strong><br />
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
                  {events.map((event) => (
                    <div key={event.id} className="border-2 border-[#a89060] rounded-lg p-4 bg-[#2a1f20]">
                      <h3 className="text-xl font-bold text-[#fff3b0]">{event.name}</h3>
                      <p className="text-[#a89060]">{event.date}</p>
                      <p className="text-[#a89060]">{event.location.city}, {event.location.country}</p>
                      <div className="flex mt-4 space-x-2">
                        <button
                          onClick={() => handleSelectEvent(event)}
                          className="bg-[#e3a63e] text-[#1a0f10] px-4 py-2 rounded-lg font-bold"
                        >
                          See on Map
                        </button>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                          See Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MapPage;