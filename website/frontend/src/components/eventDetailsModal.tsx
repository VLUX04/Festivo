import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from './event';
import { getAuthToken, getStoredUser, isAuthenticated } from '../utils/auth';
import { fetchFriendContacts, type FriendContact } from '../utils/community';

const actionButtonClass = 'min-w-[170px] border-2 border-[#fff3b0] bg-[#1a0f10] px-5 py-3 font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:!text-[#1a0f10] disabled:cursor-not-allowed disabled:border-[#483d30] disabled:text-[#483d30]';

type EventReview = {
  id: number;
  reviewerUsername: string;
  reviewerName: string;
  rating: number;
  information: string;
  sentDate: string;
};

type EventDetailsModalProps = {
  event: Event | null;
  onClose: () => void;
  onSeeOnMap?: (event: Event) => void;
};

const API_BASE_URL = 'http://localhost:3000';

type GalleryItem = {
  id: number;
  author: string;
  username: string;
  image: string;
  mediaType: 'image' | 'video';
  caption: string;
  likes: number;
  date: string;
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onSeeOnMap }) => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const isLoggedIn = isAuthenticated();
  const isOrganizer = Boolean(event && currentUser && event.promoterUsername === currentUser.username);

  const [reviews, setReviews] = React.useState<EventReview[]>([]);
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewText, setReviewText] = React.useState('');
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [attending, setAttending] = React.useState(false);
  const [attendLoading, setAttendLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [showReviews, setShowReviews] = React.useState(false);
  const [showGallery, setShowGallery] = React.useState(false);
  const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = React.useState(false);
  const [contacts, setContacts] = React.useState<FriendContact[]>([]);
  const [shareContactUsername, setShareContactUsername] = React.useState('');
  const [shareLoading, setShareLoading] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isLoggedIn) {
      void fetchFriendContacts().then((list) => {
        setContacts(list);
        if (list.length > 0) setShareContactUsername(list[0].username);
      });
    }
  }, [isLoggedIn]);

  React.useEffect(() => {
    if (!event?.id) return;

    const token = getAuthToken();

    fetch(`${API_BASE_URL}/events/${event.id}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReviews(data.reviews as EventReview[]);
      })
      .catch(() => undefined);

    if (token) {
      fetch(`${API_BASE_URL}/events/${event.id}/attend-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setAttending(data.attending as boolean);
        })
        .catch(() => undefined);

      fetch(`${API_BASE_URL}/events/${event.id}/save-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setSaved(data.saved as boolean);
        })
        .catch(() => undefined);
    }
  }, [event?.id]);

  const handleShareEvent = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!event) return;
    const token = getAuthToken();
    if (!token || !shareContactUsername || !event.id) return;

    setShareLoading(true);
    try {
      const initRes = await fetch(`${API_BASE_URL}/chat/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friendUsername: shareContactUsername }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) throw new Error('Could not open chat');

      const content = JSON.stringify({
        kind: 'share',
        itemType: 'event',
        itemId: event.id,
        title: event.title,
        url: `/events?eventId=${event.id}`,
        body: `${event.date} · ${event.location}`,
      });

      const sendRes = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId: String(initData.chatId), content }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok || !sendData.success) throw new Error('Could not send message');

      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch {
      /* ignore */
    } finally {
      setShareLoading(false);
    }
  };

  if (!event) return null;

  const handleTicketClick = () => {
    if (event.ticketLink) {
      window.open(event.ticketLink, '_blank', 'noreferrer');
      return;
    }
    window.alert('Ticket link not available for this event yet.');
  };

  const handleAttend = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const token = getAuthToken();
    if (!token || !event.id) return;

    setAttendLoading(true);
    try {
      const method = attending ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/events/${event.id}/attend`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAttending(!attending);
    } catch {
      /* ignore */
    } finally {
      setAttendLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const token = getAuthToken();
    if (!token || !event.id) return;

    setSaveLoading(true);
    try {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/events/${event.id}/save`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSaved(!saved);
    } catch {
      /* ignore */
    } finally {
      setSaveLoading(false);
    }
  };

  const loadGallery = async () => {
    if (!event.id) return;
    setGalleryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${event.id}/gallery`);
      const data = await res.json();
      if (data.success) setGallery(data.gallery as GalleryItem[]);
    } catch {
      /* ignore */
    } finally {
      setGalleryLoading(false);
    }
  };

  const toggleGallery = () => {
    if (!showGallery && gallery.length === 0) void loadGallery();
    setShowGallery((v) => !v);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    const token = getAuthToken();
    if (!token || !event.id || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${event.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, information: reviewText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await fetch(`${API_BASE_URL}/events/${event.id}/reviews`);
        const refreshedData = await refreshed.json();
        if (refreshedData.success) setReviews(refreshedData.reviews as EventReview[]);
        setReviewText('');
        setReviewRating(5);
      }
    } catch {
      /* ignore */
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0506]/80 px-4 py-8 backdrop-blur-sm'>
      <div className='max-h-[88vh] w-full max-w-4xl overflow-y-auto border-4 border-[#fff3b0] bg-[#1a0f10] shadow-[0_20px_80px_rgba(0,0,0,0.55)]'>
        <div className='relative'>
          <img src={event.src} alt={event.alt} className='h-72 w-full object-cover' />
          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0506] to-transparent px-6 py-5'>
            <span className='inline-flex border border-[#fff3b0] bg-[#1a0f10]/80 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>
              {event.type}
            </span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='absolute right-4 top-4 h-10 w-10 border border-[#fff3b0] bg-[#1a0f10]/80 text-xl font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10]'
            aria-label='Close event details'
          >
            ×
          </button>
        </div>

        <div className='space-y-5 px-6 py-6'>
          <div className='space-y-2'>
            <h2 className='text-4xl font-bold text-[#fff3b0]'>{event.title}</h2>
            <button
              type='button'
              onClick={() => {
                if (!event.promoterUsername) return;
                navigate(`/profile/${event.promoterUsername}`);
              }}
              className='text-left text-xl text-[#a89060] transition hover:text-[#fff3b0]'
            >
              {event.promoter}
            </button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Location</p>
              <p className='mt-2 text-lg'>{event.location}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Schedule</p>
              <p className='mt-2 text-lg'>{event.date} {event.time}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Attendance</p>
              <p className='mt-2 text-lg'>{event.attending}</p>
            </div>
            <div className='border-2 border-[#483d30] bg-[#120707] p-4 text-[#a89060]'>
              <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Price</p>
              <p className='mt-2 text-lg'>{event.price}</p>
            </div>
          </div>

          <p className='leading-8 text-[#f1e2ba]'>{event.description}</p>

          <div className='space-y-4 border-t border-[#483d30] pt-5'>
            <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-center flex-wrap'>
              <button
                type='button'
                onClick={() => {
                  if (onSeeOnMap) { onSeeOnMap(event); return; }
                  navigate(`/map?eventId=${event.id ?? ''}`);
                }}
                className={`${actionButtonClass} bg-transparent`}
              >
                See on Map
              </button>
              <button
                type='button'
                onClick={handleTicketClick}
                className={`${actionButtonClass} bg-transparent`}
              >
                Buy Ticket
              </button>
              <button
                type='button'
                onClick={() => void handleAttend()}
                disabled={attendLoading}
                className={`${actionButtonClass} ${attending ? 'bg-[#fff3b0] !text-[#1a0f10]' : 'bg-transparent'}`}
              >
                {attendLoading ? '...' : attending ? 'Cancel RSVP' : 'RSVP / Attend'}
              </button>
              <button
                type='button'
                onClick={() => void handleSave()}
                disabled={saveLoading}
                className={`${actionButtonClass} ${saved ? 'bg-[#fff3b0] !text-[#1a0f10]' : 'bg-transparent'}`}
              >
                {saveLoading ? '...' : saved ? '★ Saved' : '☆ Save'}
              </button>
              {isOrganizer && event.id ? (
                <button
                  type='button'
                  onClick={() => navigate(`/work/edit/${event.id}`)}
                  className={`${actionButtonClass} bg-transparent`}
                >
                  Edit Event
                </button>
              ) : null}
              {isOrganizer && event.id ? (
                <button
                  type='button'
                  onClick={() => navigate(`/events/${event.id}/manage`)}
                  className={`${actionButtonClass} bg-transparent`}
                >
                  Manage Guests
                </button>
              ) : null}
            </div>
          </div>

          {isLoggedIn && contacts.length > 0 ? (
            <div className='border-t border-[#483d30] pt-5 space-y-3'>
              <h3 className='text-xl font-bold text-[#fff3b0]'>Share with a Contact</h3>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <select
                  value={shareContactUsername}
                  onChange={(e) => setShareContactUsername(e.target.value)}
                  className='flex-1 border-2 border-[#483d30] bg-[#120707] px-3 py-2 text-[#fff3b0] outline-none focus:border-[#fff3b0]'
                >
                  {contacts.map((c) => (
                    <option key={c.username} value={c.username}>{c.name} (@{c.username})</option>
                  ))}
                </select>
                <button
                  type='button'
                  onClick={() => void handleShareEvent()}
                  disabled={shareLoading || !shareContactUsername}
                  className='border-2 border-[#fff3b0] px-5 py-2 font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10] disabled:opacity-50'
                >
                  {shareLoading ? 'Sending...' : shareSuccess ? 'Sent!' : 'Share Event'}
                </button>
              </div>
            </div>
          ) : null}

          <div className='border-t border-[#483d30] pt-5 space-y-4'>
            <div className='flex items-center justify-between gap-4'>
              <button
                type='button'
                onClick={toggleGallery}
                className='text-2xl font-bold text-[#fff3b0] flex items-center gap-2'
              >
                Community Gallery {showGallery ? '▲' : '▼'}
              </button>
              {isLoggedIn && event.id ? (
                <button
                  type='button'
                  onClick={() => navigate(`/social?eventId=${event.id}`)}
                  className='border-2 border-[#e09f3e] px-4 py-2 text-sm font-bold text-[#e09f3e] transition hover:bg-[#e09f3e] hover:text-[#1a0f10] whitespace-nowrap'
                >
                  + Post about this event
                </button>
              ) : null}
            </div>
            {showGallery ? (
              <div>
                {galleryLoading ? (
                  <p className='text-[#a89060]'>Loading...</p>
                ) : gallery.length === 0 ? (
                  <p className='text-[#a89060]'>No community photos yet. Be the first to share one from the Social page!</p>
                ) : (
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {gallery.map((item) => (
                      <div key={item.id} className='border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                        {item.mediaType === 'video' ? (
                          <video src={item.image} className='h-36 w-full object-cover' muted playsInline />
                        ) : (
                          <img src={item.image} alt={item.caption} className='h-36 w-full object-cover' />
                        )}
                        <div className='p-2'>
                          <p className='text-xs font-semibold text-[#fff3b0] truncate'>{item.caption}</p>
                          <p className='text-[10px] text-[#a89060]'>@{item.username} · {item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className='border-t border-[#483d30] pt-5 space-y-4'>
            <button
              type='button'
              onClick={() => setShowReviews(!showReviews)}
              className='text-2xl font-bold text-[#fff3b0] flex items-center gap-2'
            >
              Reviews ({reviews.length}) {showReviews ? '▲' : '▼'}
            </button>

            {showReviews ? (
              <div className='space-y-4'>
                {reviews.length === 0 ? (
                  <p className='text-[#a89060]'>No reviews yet. Be the first to review this event!</p>
                ) : (
                  reviews.map((review) => (
                    <article key={review.id} className='border-2 border-[#483d30] bg-[#120707] p-4'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                          <p className='font-bold text-[#fff3b0]'>{review.reviewerName}</p>
                          <p className='text-sm text-[#a89060]'>@{review.reviewerUsername}</p>
                        </div>
                        <span className='border border-[#fff3b0] px-2 py-1 text-xs uppercase tracking-[0.2em] text-[#fff3b0]'>
                          {review.rating}/5
                        </span>
                      </div>
                      <p className='mt-3 text-[#f1e2ba]'>{review.information}</p>
                      <p className='mt-2 text-xs text-[#8b7355]'>{new Date(review.sentDate).toLocaleDateString()}</p>
                    </article>
                  ))
                )}

                {isLoggedIn && !isOrganizer ? (
                  <form onSubmit={(e) => void handleReviewSubmit(e)} className='space-y-3 border-2 border-[#483d30] bg-[#120707] p-4'>
                    <h3 className='text-lg font-bold text-[#fff3b0]'>Leave a Review</h3>
                    <label className='block'>
                      <span className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Rating</span>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className='mt-1 w-full border-2 border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] outline-none focus:border-[#fff3b0]'
                      >
                        {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
                      </select>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder='Share your experience at this event...'
                      className='w-full border-2 border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                    />
                    <div className='flex justify-end'>
                      <button
                        type='submit'
                        disabled={submittingReview || !reviewText.trim()}
                        className='border-2 border-[#fff3b0] bg-[#fff3b0] px-4 py-2 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
