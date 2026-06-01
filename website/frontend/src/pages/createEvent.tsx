import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import { getStoredUser, isProfessionalRole } from '../utils/auth.ts';
import { createEvent } from '../utils/events.ts';

const defaultFormState = {
  title: '',
  eventType: '',
  venue: '',
  sdate: '',
  edate: '',
  eventTime: '',
  target: '',
  description: '',
  price: '',
  ticketLink: '',
  imageUrl: '',
  imageAlt: '',
};

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
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return selected ? <Marker position={[selected.lat, selected.lng]} /> : null;
};

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const user = React.useMemo(() => getStoredUser(), []);
  const canAccessWork = isProfessionalRole(user?.role);
  const [formData, setFormData] = React.useState(defaultFormState);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedCoords, setSelectedCoords] = React.useState<SelectedCoords | null>(null);

  React.useEffect(() => {
    if (!canAccessWork) {
      navigate('/events', { replace: true });
    }
  }, [canAccessWork, navigate]);

  if (!canAccessWork) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((previous) => ({
        ...previous,
        imageUrl: typeof reader.result === 'string' ? reader.result : '',
        imageAlt: previous.imageAlt || file.name.replace(/\.[^.]+$/, ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCoords) {
      setError('Select a location on the map before saving the event.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createEvent({
        ...formData,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        target: formData.target || undefined,
        price: formData.price || undefined,
        ticketLink: formData.ticketLink || undefined,
        imageUrl: formData.imageUrl || undefined,
        imageAlt: formData.imageAlt || undefined,
      });

      navigate('/events');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
          <h1 className='text-[#fff3b0] text-5xl font-bold mb-4'>CREATE EVENT</h1>
          <p className='text-[#a89060] text-xl'>Publish a new event directly into the database.</p>

          <form className='mt-8 grid gap-5 md:grid-cols-2' onSubmit={handleSubmit}>
            <input name='title' value={formData.title} onChange={handleChange} required placeholder='Event title' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='eventType' value={formData.eventType} onChange={handleChange} required placeholder='Event type' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='venue' value={formData.venue} onChange={handleChange} required placeholder='Venue' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='target' value={formData.target} onChange={handleChange} placeholder='Target audience' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='sdate' value={formData.sdate} onChange={handleChange} required type='date' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='edate' value={formData.edate} onChange={handleChange} required type='date' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='eventTime' value={formData.eventTime} onChange={handleChange} required type='time' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='price' value={formData.price} onChange={handleChange} placeholder='Price' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='ticketLink' value={formData.ticketLink} onChange={handleChange} placeholder='Ticket link' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <label className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus-within:border-[#fff3b0] md:col-span-2'>
              <span className='block text-sm font-semibold text-[#fff3b0] mb-2'>Cover image file</span>
              <input
                type='file'
                accept='.png,.jpg,.jpeg,image/png,image/jpeg'
                onChange={handleImageUpload}
                className='w-full text-sm text-[#fff3b0] file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-[#fff3b0] file:text-[#540b0e] hover:file:bg-[#e09f3e] cursor-pointer'
              />
              {formData.imageUrl ? (
                <div className='mt-3 overflow-hidden border border-[#483d30]'>
                  <img src={formData.imageUrl} alt={formData.imageAlt || formData.title || 'Event cover preview'} className='h-44 w-full object-cover' />
                </div>
              ) : null}
            </label>
            <input name='imageAlt' value={formData.imageAlt} onChange={handleChange} placeholder='Cover image alt text' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />
            <textarea name='description' value={formData.description} onChange={handleChange} required rows={6} placeholder='Description' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />

            <div className='md:col-span-2 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-[#fff3b0]'>Event location</span>
                <span className='text-sm text-[#a89060]'>Click on the map to choose a spot.</span>
              </div>
              <div className='h-[360px] w-full border-2 border-[#483d30]'>
                <MapContainer center={defaultCenter} zoom={11} className='h-full w-full'>
                  <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationPicker selected={selectedCoords} onChange={setSelectedCoords} />
                </MapContainer>
              </div>
              {selectedCoords ? (
                <p className='text-sm text-[#a89060]'>Selected coordinates: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}</p>
              ) : (
                <p className='text-sm text-[#a89060]'>No location selected yet.</p>
              )}
            </div>

            {error && <p className='text-[#ff8f8f] md:col-span-2'>{error}</p>}

            <div className='md:col-span-2 flex gap-4'>
              <button type='submit' disabled={isSubmitting} className='border-3 border-[#fff3b0] bg-[#fff3b0] px-6 py-3 text-[#540b0e] transition duration-300 ease-in-out hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'>
                {isSubmitting ? 'Creating...' : 'Save Event'}
              </button>
              <button type='button' onClick={() => navigate('/work')} className='border-3 border-[#483d30] px-6 py-3 text-[#fff3b0] transition duration-300 ease-in-out hover:border-[#fff3b0]'>
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEventPage;