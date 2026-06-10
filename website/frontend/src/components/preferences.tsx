import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import location_icon from '../icons/map.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [41.1579, -8.6291];

type SelectedCoords = { lat: number; lng: number };

const LocationPicker: React.FC<{
  selected: SelectedCoords | null;
  onChange: (coords: SelectedCoords) => void;
}> = ({ selected, onChange }) => {
  useMapEvents({
    click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return selected ? <Marker position={[selected.lat, selected.lng]} /> : null;
};

type PreferencesProps = {
  accountType: string;
  onChange: (data: { bio: string; location: string }) => void;
};

const Preferences: React.FC<PreferencesProps> = ({ accountType, onChange }) => {
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<SelectedCoords | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const handleMapClick = async (newCoords: SelectedCoords) => {
    setCoords(newCoords);
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${newCoords.lat}&lon=${newCoords.lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state || '';
      const country = data.address?.country || '';
      const locationStr = [city, country].filter(Boolean).join(', ') ||
        `${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`;
      setLocation(locationStr);
      onChange({ bio, location: locationStr });
    } catch {
      const fallback = `${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`;
      setLocation(fallback);
      onChange({ bio, location: fallback });
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <>
      <div className='w-[82%] border-2 border-[#483d30] bg-[#1a0f10] p-8'>
        <div className='flex items-center justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-3xl font-bold text-[#fff3b0]'>Account Type</h2>
            <p className='text-[#a89060] mt-1'>Your selected role on Festivo.</p>
          </div>
          <div className='flex items-center gap-4'>
            <span className='border border-[#fff3b0] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#fff3b0]'>{accountType}</span>
            <button
              type='button'
              onClick={() => navigate('/account')}
              className='border-2 border-[#483d30] px-4 py-2 text-sm font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'
            >
              Change
            </button>
          </div>
        </div>

        <div className='border-t border-[#483d30] pt-6 space-y-3'>
          <h2 className='text-3xl font-bold text-[#fff3b0]'>About You</h2>
          <p className='text-[#a89060]'>Tell us about yourself, your interests, or what you do.</p>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); onChange({ bio: e.target.value, location }); }}
            placeholder='Your story, interests, or what you do...'
            rows={4}
            className='w-full border-2 border-[#483d30] bg-[#120707] p-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0] resize-none'
          />
        </div>
      </div>

      <div className='w-[82%] border-2 border-[#483d30] bg-[#1a0f10] p-8 space-y-4'>
        <div className='flex items-center gap-3'>
          <img src={location_icon} alt='' className='w-6 h-6 object-contain' aria-hidden='true' />
          <h2 className='text-3xl font-bold text-[#fff3b0]'>Your Location</h2>
        </div>
        <p className='text-[#a89060]'>Click on the map to set your location — we'll auto-detect the city name.</p>

        <div className='h-[320px] w-full border-2 border-[#483d30]'>
          <MapContainer center={defaultCenter} zoom={5} className='h-full w-full'>
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; OpenStreetMap contributors'
            />
            <LocationPicker selected={coords} onChange={(c) => void handleMapClick(c)} />
          </MapContainer>
        </div>

        {geocoding ? (
          <p className='text-[#a89060] text-sm'>Detecting location...</p>
        ) : location ? (
          <div className='flex items-center gap-2 border-2 border-[#483d30] bg-[#120707] px-4 py-3'>
            <img src={location_icon} alt='' className='w-4 h-4 object-contain' aria-hidden='true' />
            <p className='text-[#fff3b0] font-semibold'>{location}</p>
          </div>
        ) : (
          <p className='text-[#a89060] text-sm'>No location selected — click a spot on the map above.</p>
        )}
      </div>
    </>
  );
};

export default Preferences;
