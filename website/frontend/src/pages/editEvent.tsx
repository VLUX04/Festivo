import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import { getAuthToken, getStoredUser, isProfessionalRole } from '../utils/auth.ts';

const API_BASE_URL = 'http://localhost:3000';

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
};

const EditEventPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);
  const user = React.useMemo(() => getStoredUser(), []);
  const canAccessWork = isProfessionalRole(user?.role);

  const [formData, setFormData] = React.useState(defaultFormState);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!canAccessWork) { navigate('/events', { replace: true }); return; }
    if (!eventId) { navigate('/events', { replace: true }); return; }

    fetch(`${API_BASE_URL}/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.event) {
          const ev = data.event;
          setFormData({
            title: ev.title || '',
            eventType: ev.eventType || '',
            venue: ev.venue || '',
            sdate: ev.sdate ? (ev.sdate as string).split('T')[0] : '',
            edate: ev.edate ? (ev.edate as string).split('T')[0] : '',
            eventTime: ev.eventTime || '',
            target: ev.target || '',
            description: ev.description || '',
            price: ev.price || '',
            ticketLink: ev.ticketLink || '',
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [canAccessWork, eventId, navigate]);

  if (!canAccessWork) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          eventType: formData.eventType,
          venue: formData.venue,
          sdate: formData.sdate,
          edate: formData.edate,
          eventTime: formData.eventTime,
          target: formData.target || undefined,
          description: formData.description,
          price: formData.price || undefined,
          ticketLink: formData.ticketLink || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update event');
      }

      navigate('/events');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className='w-full p-4 flex flex-col items-center mt-6'>
          <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 text-[#fff3b0]'>Loading event...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
          <h1 className='text-[#fff3b0] text-5xl font-bold mb-4'>EDIT EVENT</h1>
          <p className='text-[#a89060] text-xl'>Update the event details below.</p>

          <form className='mt-8 grid gap-5 md:grid-cols-2' onSubmit={(e) => void handleSubmit(e)}>
            <input name='title' value={formData.title} onChange={handleChange} required placeholder='Event title' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='eventType' value={formData.eventType} onChange={handleChange} required placeholder='Event type' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='venue' value={formData.venue} onChange={handleChange} required placeholder='Venue' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='target' value={formData.target} onChange={handleChange} placeholder='Target audience' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <div className='space-y-1'>
              <label className='text-xs text-[#a89060]'>Start Date</label>
              <input name='sdate' value={formData.sdate} onChange={handleChange} required type='date' className='w-full border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-[#a89060]'>End Date</label>
              <input name='edate' value={formData.edate} onChange={handleChange} required type='date' className='w-full border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-[#a89060]'>Event Time</label>
              <input name='eventTime' value={formData.eventTime} onChange={handleChange} required type='time' className='w-full border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            </div>
            <input name='price' value={formData.price} onChange={handleChange} placeholder='Price' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
            <input name='ticketLink' value={formData.ticketLink} onChange={handleChange} placeholder='Ticket link' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />
            <textarea name='description' value={formData.description} onChange={handleChange} required rows={6} placeholder='Description' className='border-2 border-[#483d30] bg-[#2a1f20] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />

            {error ? <p className='text-[#ff8f8f] md:col-span-2'>{error}</p> : null}

            <div className='md:col-span-2 flex gap-4'>
              <button type='submit' disabled={isSubmitting} className='border-2 border-[#fff3b0] bg-[#fff3b0] px-6 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type='button' onClick={() => navigate(-1)} className='border-2 border-[#483d30] px-6 py-3 font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditEventPage;
