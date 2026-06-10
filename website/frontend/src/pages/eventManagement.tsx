import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import { getAuthToken, getStoredUser, isProfessionalRole } from '../utils/auth.ts';

const API_BASE_URL = 'http://localhost:3000';

type Attendee = {
  userId: number;
  name: string;
  username: string;
  role: string;
  status: string;
  attendedAt: string;
};

const GUEST_TIERS = ['Going', 'VIP', 'DJ', 'Worker', 'Guest', 'Checked In'];

const EventManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);
  const user = React.useMemo(() => getStoredUser(), []);
  const canAccess = isProfessionalRole(user?.role);

  const [attendees, setAttendees] = React.useState<Attendee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [inviteUsername, setInviteUsername] = React.useState('');
  const [inviteMessage, setInviteMessage] = React.useState('');
  const [inviteError, setInviteError] = React.useState('');
  const [inviteSuccess, setInviteSuccess] = React.useState('');
  const [sendingInvite, setSendingInvite] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<{
    attendance: { total: number; going: number; vip: number };
    reviews: { total: number; avg_rating: string };
    publications: { total: number; total_likes: number; total_shares: number };
    saves: number;
  } | null>(null);

  const loadAttendees = React.useCallback(async () => {
    const token = getAuthToken();
    if (!token || !eventId) return;

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load attendees');
      setAttendees(data.attendees as Attendee[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendees');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    if (!canAccess) { navigate('/events', { replace: true }); return; }
    void loadAttendees();

    const token = getAuthToken();
    if (token && eventId) {
      fetch(`${API_BASE_URL}/events/${eventId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => { if (data.success) setAnalytics(data.analytics); })
        .catch(() => undefined);
    }
  }, [canAccess, loadAttendees, navigate]);

  if (!canAccess) return null;

  const handleStatusChange = async (userId: number, status: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/events/${eventId}/attendees/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setAttendees((prev) => prev.map((a) => a.userId === userId ? { ...a, status } : a));
    } catch {
      /* ignore */
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !inviteUsername.trim()) return;

    setSendingInvite(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ professionalUsername: inviteUsername.trim(), message: inviteMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send invite');
      setInviteSuccess(`Invite sent to @${inviteUsername.trim()}`);
      setInviteUsername('');
      setInviteMessage('');
      void loadAttendees();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const tierCounts = GUEST_TIERS.reduce<Record<string, number>>((acc, tier) => {
    acc[tier] = attendees.filter((a) => a.status === tier).length;
    return acc;
  }, {});

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-[#fff3b0] text-5xl font-bold'>GUEST LIST</h1>
              <p className='text-[#a89060] text-xl mt-2'>Manage attendees and assign tiers for this event.</p>
            </div>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='border-2 border-[#483d30] px-4 py-2 text-[#fff3b0] hover:border-[#fff3b0] transition'
            >
              Back
            </button>
          </div>
        </div>

        {analytics ? (
          <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-4'>
            <h2 className='text-3xl font-bold text-[#fff3b0]'>Analytics</h2>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-center'>
                <p className='text-[#a89060] text-sm'>Total RSVPs</p>
                <p className='text-3xl font-bold text-[#fff3b0]'>{analytics.attendance.total}</p>
              </div>
              <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-center'>
                <p className='text-[#a89060] text-sm'>Avg. Review</p>
                <p className='text-3xl font-bold text-[#fff3b0]'>{analytics.reviews.avg_rating ? `${analytics.reviews.avg_rating}/5` : '—'}</p>
                <p className='text-xs text-[#8b7355]'>{analytics.reviews.total} reviews</p>
              </div>
              <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-center'>
                <p className='text-[#a89060] text-sm'>Community Posts</p>
                <p className='text-3xl font-bold text-[#fff3b0]'>{analytics.publications.total}</p>
                <p className='text-xs text-[#8b7355]'>{analytics.publications.total_likes} likes · {analytics.publications.total_shares} shares</p>
              </div>
              <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-center'>
                <p className='text-[#a89060] text-sm'>Saves</p>
                <p className='text-3xl font-bold text-[#fff3b0]'>{analytics.saves}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-4'>
          <h2 className='text-3xl font-bold text-[#fff3b0]'>RSVP Statistics</h2>
          <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-6'>
            {GUEST_TIERS.map((tier) => (
              <div key={tier} className='border-2 border-[#483d30] bg-[#120707] p-4 text-center'>
                <p className='text-[#a89060] text-sm'>{tier}</p>
                <p className='text-3xl font-bold text-[#fff3b0]'>{tierCounts[tier] || 0}</p>
              </div>
            ))}
          </div>
          <div className='border-2 border-[#fff3b0] bg-[#120707] p-4 text-center'>
            <p className='text-[#a89060]'>Total RSVPs</p>
            <p className='text-4xl font-bold text-[#fff3b0]'>{attendees.length}</p>
          </div>
        </div>

        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-4'>
          <h2 className='text-3xl font-bold text-[#fff3b0]'>Assign Worker / Performer</h2>
          <p className='text-[#a89060]'>Invite a professional by username to work at this event.</p>
          <form onSubmit={(e) => void handleSendInvite(e)} className='space-y-3'>
            <input
              type='text'
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              placeholder='Professional username'
              className='w-full border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={2}
              placeholder='Optional message to the professional...'
              className='w-full border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
            {inviteError ? <p className='text-[#ff8f8f]'>{inviteError}</p> : null}
            {inviteSuccess ? <p className='text-[#90ee90]'>{inviteSuccess}</p> : null}
            <button
              type='submit'
              disabled={sendingInvite || !inviteUsername.trim()}
              className='border-2 border-[#fff3b0] bg-[#fff3b0] px-5 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'
            >
              {sendingInvite ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>

        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-4'>
          <div className='flex items-end justify-between gap-4'>
            <h2 className='text-3xl font-bold text-[#fff3b0]'>Attendee List</h2>
            <span className='text-[#a89060] uppercase tracking-[0.2em]'>{attendees.length} total</span>
          </div>

          {loading ? (
            <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>Loading...</div>
          ) : error ? (
            <div className='border-2 border-[#ff6b6b] bg-[#120707] px-4 py-6 text-[#ffb3b3]'>{error}</div>
          ) : attendees.length === 0 ? (
            <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>No RSVPs yet.</div>
          ) : (
            <div className='grid gap-3'>
              {attendees.map((attendee) => (
                <div key={attendee.userId} className='border-2 border-[#483d30] bg-[#120707] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div>
                    <p className='font-bold text-[#fff3b0]'>{attendee.name}</p>
                    <p className='text-sm text-[#a89060]'>@{attendee.username}</p>
                    <p className='text-xs text-[#8b7355]'>{attendee.role}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <select
                      value={attendee.status}
                      onChange={(e) => void handleStatusChange(attendee.userId, e.target.value)}
                      className='border-2 border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] outline-none focus:border-[#fff3b0]'
                    >
                      {GUEST_TIERS.map((tier) => (
                        <option key={tier} value={tier}>{tier}</option>
                      ))}
                    </select>
                    <span className='text-xs text-[#8b7355]'>{new Date(attendee.attendedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EventManagementPage;
