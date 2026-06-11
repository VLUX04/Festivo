import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type LatLng = { lat: number; lng: number };

type Props = {
  onConfirm: (locationText: string) => void;
  onClose: () => void;
  initialText?: string;
};

type NominatimResult = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  display_name?: string;
};

const formatLocation = (result: NominatimResult): string => {
  const addr = result.address ?? {};
  const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? addr.state ?? '';
  const country = addr.country ?? '';
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return result.display_name?.split(',').slice(0, 2).join(',').trim() ?? '';
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json() as NominatimResult;
    return formatLocation(data);
  } catch {
    return '';
  }
};

const ClickHandler: React.FC<{ onPick: (latlng: LatLng) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LocationPicker: React.FC<Props> = ({ onConfirm, onClose }) => {
  const [marker, setMarker] = React.useState<LatLng | null>(null);
  const [resolving, setResolving] = React.useState(false);
  const [resolved, setResolved] = React.useState('');

  const handlePick = async (latlng: LatLng) => {
    setMarker(latlng);
    setResolving(true);
    setResolved('');
    const text = await reverseGeocode(latlng.lat, latlng.lng);
    setResolved(text);
    setResolving(false);
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/70' onClick={onClose}>
      <div
        className='w-[90vw] max-w-2xl bg-[#1a0f10] border-4 border-[#fff3b0] flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between px-5 py-4 border-b border-[#483d30]'>
          <div>
            <h2 className='text-[#fff3b0] text-xl font-bold'>Pick your location</h2>
            <p className='text-[#a89060] text-sm mt-0.5'>Click anywhere on the map to select a city.</p>
          </div>
          <button type='button' onClick={onClose} className='text-[#a89060] hover:text-[#fff3b0] text-2xl leading-none transition'>×</button>
        </div>

        <div className='h-[380px] w-full'>
          <MapContainer
            center={[48.0, 10.0]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomControl
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='© OpenStreetMap contributors'
            />
            <ClickHandler onPick={(latlng) => { void handlePick(latlng); }} />
            {marker ? <Marker position={[marker.lat, marker.lng]} /> : null}
          </MapContainer>
        </div>

        <div className='px-5 py-4 border-t border-[#483d30] flex items-center gap-3'>
          <div className='flex-1 px-3 py-2 bg-[#0a0505] border-2 border-[#483d30] text-sm min-h-[38px] flex items-center'>
            {resolving ? (
              <span className='text-[#a89060]'>Detecting location…</span>
            ) : resolved ? (
              <span className='text-[#fff3b0]'>{resolved}</span>
            ) : (
              <span className='text-[#8b7355]'>No location selected</span>
            )}
          </div>
          <button
            type='button'
            disabled={!resolved || resolving}
            onClick={() => { if (resolved) onConfirm(resolved); }}
            className='px-5 py-2 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#540b0e] font-bold hover:bg-[#e09f3e] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0'
          >
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
