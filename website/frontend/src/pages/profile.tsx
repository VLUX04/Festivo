import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import editIcon from '../icons/edit-profile.png';
import editDarkIcon from '../icons/edit-profile-dark.png';
import { getAuthToken, getStoredUser, isAuthenticated, isProfessionalRole, updateStoredUser } from '../utils/auth';
import { useCommunityState } from '../utils/community.ts';

type PublicProfileReview = {
  id: number;
  reviewerUsername: string;
  reviewerName: string;
  rating: number;
  information: string;
  sentDate: string;
};

type PublicProfile = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  location: string | null;
  profileType: string;
  isVerified: boolean;
  genre: string | null;
  rating: number | null;
  preferences: string[];
  publicationCount: number;
  followersCount: number;
  friendsCount: number;
  isMe: boolean;
  isFollowing: boolean;
  canReview: boolean;
  reviews: PublicProfileReview[];
};

const API_BASE_URL = 'http://localhost:3000';

const emptyProfileReview = {
  rating: 5,
  information: '',
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const currentUser = React.useMemo(() => getStoredUser(), []);
  const isLoggedIn = isAuthenticated();
  const communityState = useCommunityState();
  const [publicProfile, setPublicProfile] = React.useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [profileError, setProfileError] = React.useState('');
  const [reviewDraft, setReviewDraft] = React.useState(emptyProfileReview);
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [savedEvents, setSavedEvents] = React.useState<Array<{
    id: number; title: string; eventType: string; venue: string; sdate: string; price: string;
  }>>([]);
  const [myWorkOpportunities, setMyWorkOpportunities] = React.useState<Array<{
    id: number;
    title: string;
    position: string;
    location: string | null;
    createdAt: string;
  }>>([]);
  const [myAssignments, setMyAssignments] = React.useState<Array<{
    id: number;
    title: string;
    eventType: string;
    location: string;
    sdate: string;
    status: string;
  }>>([]);

  const [userPublications, setUserPublications] = React.useState<Array<{
    id: number; image: string; caption: string; location: string; likes: number; favorites: number; shares: number; eventId: number | null; eventTitle: string | null; comments: unknown[];
  }>>([]);

  const profileUsername = params.username || currentUser?.username || '';
  const viewingOtherProfile = Boolean(params.username && params.username !== currentUser?.username);
  const activeProfile = publicProfile;
  const isSelfProfile = activeProfile?.isMe ?? !viewingOtherProfile;
  const isProfessionalProfile = activeProfile ? activeProfile.role === 'professional' : isProfessionalRole(currentUser?.role);

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (currentUser?.role === 'customer') {
      const token = getAuthToken();
      if (token) {
        void fetch('http://localhost:3000/events/saved', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => { if (data.success) setSavedEvents(data.events || []); })
          .catch(() => undefined);
      }
    }

    if (isProfessionalRole(currentUser?.role)) {
      const token = getAuthToken();

      if (token) {
        void fetch('http://localhost:3000/work/opportunities/mine', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) setMyWorkOpportunities(data.opportunities || []);
          })
          .catch(() => undefined);

        void fetch('http://localhost:3000/events/my-assignments', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) setMyAssignments(data.assignments || []);
          })
          .catch(() => undefined);
      }
    }

    const loadProfile = async () => {
      const token = getAuthToken();

      if (!profileUsername) {
        setProfileError('Profile not found.');
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        setProfileError('');

        const response = await fetch(`${API_BASE_URL}/social/profiles/${encodeURIComponent(profileUsername)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load profile');
        }

        setPublicProfile(data.profile as PublicProfile);
        if (!viewingOtherProfile && data.profile?.preferences) {
          updateStoredUser({ preferences: data.profile.preferences });
        }

        // Load publications for all profiles
        const pubRes = await fetch(`${API_BASE_URL}/social/profiles/${encodeURIComponent(profileUsername)}/publications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const pubData = await pubRes.json();
        if (pubRes.ok && pubData.success) {
          setUserPublications(pubData.publications || []);
        }
      } catch (loadError) {
        setProfileError(loadError instanceof Error ? loadError.message : 'Failed to load profile');
        setPublicProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, [isLoggedIn, navigate, profileUsername, viewingOtherProfile]);

  React.useEffect(() => {
    if (!publicProfile?.canReview) {
      setReviewDraft(emptyProfileReview);
    }
  }, [publicProfile?.canReview]);

  if (!isLoggedIn) {
    return null;
  }

  const displayName = activeProfile?.name || currentUser?.name || currentUser?.username || 'Festivo User';
  const displayUsername = activeProfile?.username || currentUser?.username || 'user';
  const displayEmail = isSelfProfile ? (activeProfile?.email || currentUser?.email || 'Email not set') : undefined;
  const displayRole = activeProfile?.profileType || (currentUser?.role === 'customer' ? 'Event Lover' : 'Professional');
  const displayBio = activeProfile?.bio || (isSelfProfile ? 'Find cultural experiences, concerts, exhibitions, and gatherings happening around you.' : 'No bio shared yet.');
  const displayLocation = activeProfile?.location || (isSelfProfile ? 'Location not set' : 'Location hidden');
  const displayPreferences = activeProfile?.preferences || currentUser?.preferences || [];
  const attendedEvents = communityState.attendedEvents;

  const handleFollowToggle = async () => {
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }
    if (!activeProfile) return;

    setFollowLoading(true);
    try {
      const method = activeProfile.isFollowing ? 'DELETE' : 'POST';
      const res = await fetch('http://localhost:3000/social/follows', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ professionalUsername: activeProfile.username }),
      });
      const data = await res.json();
      if (data.success) {
        setPublicProfile((prev) => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.followersCount + (prev.isFollowing ? -1 : 1),
        } : prev);
      }
    } catch {
      /* ignore */
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeProfile?.username || !activeProfile.canReview) {
      return;
    }

    if (!reviewDraft.information.trim()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`${API_BASE_URL}/social/professional-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalUsername: activeProfile.username,
          rating: reviewDraft.rating,
          information: reviewDraft.information.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviewDraft(emptyProfileReview);
      setPublicProfile((previous) => previous ? { ...previous, reviews: [data.review, ...previous.reviews] } : previous);
    } catch (submitError) {
      alert(submitError instanceof Error ? submitError.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] bg-[#1a0f10] border-4 border-[#fff3b0] p-8'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
            <div className='h-32 w-32 bg-[#3a3122] border-3 border-[#fff3b0] overflow-hidden flex items-center justify-center shrink-0'>
              {isSelfProfile && currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={`${displayName} profile`} className='h-full w-full object-cover' />
              ) : (
                <span className='text-[#fff3b0] text-4xl font-bold'>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className='flex-1 space-y-4'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-[#fff3b0] text-5xl font-bold'>{displayName}</h1>
                <p className='text-[#540b0e] px-3 py-1 bg-[#e09f3e]'>{displayRole}</p>
                {activeProfile?.isVerified ? (
                  <span className='border border-[#fff3b0] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#fff3b0]'>Verified</span>
                ) : null}
              </div>
              <p className='text-[#a89060] text-xl'>@{displayUsername}</p>
              {displayEmail ? <p className='text-[#a89060] text-xl'>{displayEmail}</p> : null}
              <div className='flex flex-wrap gap-3 mt-2 text-sm text-[#a89060]'>
                <span><span className='font-bold text-[#fff3b0]'>{activeProfile?.publicationCount ?? 0}</span> posts</span>
                {isProfessionalProfile ? (
                  <span><span className='font-bold text-[#fff3b0]'>{activeProfile?.followersCount ?? 0}</span> followers</span>
                ) : (
                  <span><span className='font-bold text-[#fff3b0]'>{activeProfile?.friendsCount ?? 0}</span> friends</span>
                )}
              </div>
              {isSelfProfile ? (
                <div className='flex flex-wrap gap-3'>
                  <button onClick={() => navigate('/edit-profile')} className='group flex flex-row items-center border-2 border-[#fff3b0] text-[#fff3b0] px-4 py-2 hover:bg-[#fff3b0] hover:text-[#1a0f10] transition duration-333 ease-in-out hover:cursor-pointer'>
                    <img src={editIcon} alt='Edit' className='h-5 w-5 object-contain mr-3 block group-hover:hidden' />
                    <img src={editDarkIcon} alt='Edit' className='h-5 w-5 object-contain mr-3 hidden group-hover:block' />
                    Edit Profile
                  </button>
                  <button onClick={() => navigate('/social')} className='border-2 border-[#483d30] px-4 py-2 text-[#fff3b0] transition hover:border-[#fff3b0] hover:bg-[#0a0505]'>
                    Go to Social
                  </button>
                </div>
              ) : isProfessionalProfile && isLoggedIn && viewingOtherProfile ? (
                <button
                  type='button'
                  onClick={() => void handleFollowToggle()}
                  disabled={followLoading}
                  className={`px-5 py-2 font-bold border-2 transition disabled:opacity-60 ${activeProfile?.isFollowing ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e] hover:bg-[#1a0f10] hover:text-[#fff3b0]' : 'border-[#fff3b0] text-[#fff3b0] hover:bg-[#fff3b0] hover:text-[#1a0f10]'}`}
                >
                  {followLoading ? '...' : activeProfile?.isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
          </div>

          {loadingProfile ? (
            <div className='mt-8 border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>Loading profile...</div>
          ) : profileError ? (
            <div className='mt-8 border-2 border-[#ff6b6b] bg-[#120707] px-4 py-6 text-[#ffb3b3]'>{profileError}</div>
          ) : null}

          {!loadingProfile && !profileError ? (
            <section className='mt-8 space-y-10'>
              <div className='grid gap-4 lg:grid-cols-[2fr_1fr]'>
                <div className='border-2 border-[#483d30] bg-[#120707] p-5'>
                  <h2 className='text-2xl font-bold text-[#fff3b0]'>About</h2>
                  <p className='mt-3 text-[#a89060] text-lg leading-8'>{displayBio}</p>
                </div>
                <div className='border-2 border-[#483d30] bg-[#120707] p-5 space-y-3'>
                  <h2 className='text-2xl font-bold text-[#fff3b0]'>Profile</h2>
                  <p className='text-[#a89060]'>Location: {displayLocation}</p>
                  <p className='text-[#a89060]'>Publications: {activeProfile?.publicationCount ?? publications.length}</p>
                  <p className='text-[#a89060]'>Reviews: {activeProfile?.reviews.length ?? 0}</p>
                </div>
              </div>

              <div>
                <div className='mb-4 flex items-end justify-between gap-4'>
                  <div>
                    <h2 className='text-3xl font-bold text-[#fff3b0]'>Interests</h2>
                    <p className='text-[#a89060]'>{isProfessionalProfile ? 'Style, genre, and category tags.' : 'Preferences and favorite event types.'}</p>
                  </div>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {displayPreferences.length > 0 ? displayPreferences.map((preference) => (
                    <span key={preference} className='px-3 py-1 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#1a0f10] text-sm'>
                      {preference}
                    </span>
                  )) : (
                    <p className='text-[#a89060] text-lg'>No preferences set yet.</p>
                  )}
                </div>
              </div>

              {activeProfile?.canReview ? (
                <form onSubmit={handleReviewSubmit} className='border-2 border-[#fff3b0] bg-[#120707] p-5 space-y-4'>
                  <div>
                    <h2 className='text-3xl font-bold text-[#fff3b0]'>Review this professional</h2>
                    <p className='text-[#a89060]'>Share your experience so other event lovers can decide faster.</p>
                  </div>
                  <label className='block'>
                    <span className='mb-2 block text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Rating</span>
                    <select
                      value={reviewDraft.rating}
                      onChange={(event) => setReviewDraft((previous) => ({ ...previous, rating: Number(event.target.value) }))}
                      className='w-full border-2 border-[#483d30] bg-[#1a0f10] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]'
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>{rating} stars</option>
                      ))}
                    </select>
                  </label>
                  <label className='block'>
                    <span className='mb-2 block text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Review</span>
                    <textarea
                      value={reviewDraft.information}
                      onChange={(event) => setReviewDraft((previous) => ({ ...previous, information: event.target.value }))}
                      rows={4}
                      placeholder='Describe what stood out most about this professional.'
                      className='w-full border-2 border-[#483d30] bg-[#1a0f10] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                    />
                  </label>
                  <div className='flex justify-end'>
                    <button
                      type='submit'
                      disabled={submittingReview}
                      className='border-2 border-[#fff3b0] bg-[#fff3b0] px-5 py-3 font-bold text-[#540b0e] transition hover:bg-[#e09f3e] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {submittingReview ? 'Submitting...' : 'Add Review'}
                    </button>
                  </div>
                </form>
              ) : null}

              {isProfessionalProfile ? (
                <div>
                  <div className='mb-4 flex items-end justify-between gap-4'>
                    <div>
                      <h2 className='text-3xl font-bold text-[#fff3b0]'>Reviews</h2>
                      <p className='text-[#a89060]'>What event lovers are saying about this profile.</p>
                    </div>
                    <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{activeProfile?.reviews.length ?? 0} items</span>
                  </div>
                  <div className='grid gap-4'>
                    {(activeProfile?.reviews || []).length > 0 ? activeProfile!.reviews.map((review) => (
                      <article key={review.id} className='border-2 border-[#483d30] bg-[#120707] p-5'>
                        <div className='flex flex-wrap items-center justify-between gap-3'>
                          <div>
                            <h3 className='text-xl font-bold text-[#fff3b0]'>{review.reviewerName}</h3>
                            <p className='text-sm text-[#a89060]'>@{review.reviewerUsername}</p>
                          </div>
                          <span className='border border-[#fff3b0] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#fff3b0]'>{review.rating}/5</span>
                        </div>
                        <p className='mt-4 text-[#f1e2ba] leading-8'>{review.information}</p>
                        <p className='mt-3 text-xs uppercase tracking-[0.2em] text-[#8b7355]'>{new Date(review.sentDate).toLocaleDateString()}</p>
                      </article>
                    )) : (
                      <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>No reviews yet.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {isSelfProfile && currentUser?.role === 'professional' ? (
                <div>
                  <div className='mb-4 flex items-end justify-between gap-4'>
                    <div>
                      <h2 className='text-3xl font-bold text-[#fff3b0]'>My Work Opportunities</h2>
                      <p className='text-[#a89060]'>Your posted roles stay here and are hidden from the public browse list.</p>
                    </div>
                    <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{myWorkOpportunities.length} items</span>
                  </div>
                  <div className='flex gap-4 overflow-x-auto pb-3'>
                    {myWorkOpportunities.length > 0 ? myWorkOpportunities.map((opportunity) => (
                      <article key={opportunity.id} className='min-w-[300px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                        <div className='space-y-2 p-4'>
                          <h3 className='text-xl font-bold text-[#fff3b0]'>{opportunity.title}</h3>
                          <p className='text-[#a89060]'>{opportunity.position}</p>
                          <p className='text-[#a89060]'>{opportunity.location || 'Location on request'}</p>
                          <p className='text-xs text-[#8b7355]'>{new Date(opportunity.createdAt).toLocaleString()}</p>
                        </div>
                      </article>
                    )) : (
                      <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>
                        No work opportunities posted yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {isSelfProfile && currentUser?.role === 'professional' ? (
                <div>
                  <div className='mb-4 flex items-end justify-between gap-4'>
                    <div>
                      <h2 className='text-3xl font-bold text-[#fff3b0]'>Event Assignments</h2>
                      <p className='text-[#a89060]'>Events you have been assigned to as a professional.</p>
                    </div>
                    <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{myAssignments.length} items</span>
                  </div>
                  <div className='flex gap-4 overflow-x-auto pb-3'>
                    {myAssignments.length > 0 ? myAssignments.map((assignment) => (
                      <article key={assignment.id} className='min-w-[300px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] p-4 space-y-2'>
                        <div className='flex items-center justify-between gap-2'>
                          <h3 className='text-xl font-bold text-[#fff3b0]'>{assignment.title}</h3>
                          <span className='border border-[#fff3b0] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#fff3b0]'>{assignment.status}</span>
                        </div>
                        <p className='text-[#a89060]'>{assignment.eventType}</p>
                        <p className='text-[#a89060]'>{assignment.location}</p>
                        <p className='text-xs text-[#8b7355]'>{assignment.sdate ? new Date(assignment.sdate).toLocaleDateString() : ''}</p>
                      </article>
                    )) : (
                      <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>No event assignments yet.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {isSelfProfile && currentUser?.role !== 'professional' && savedEvents.length > 0 ? (
                <div>
                  <div className='mb-4 flex items-end justify-between gap-4'>
                    <div>
                      <h2 className='text-3xl font-bold text-[#fff3b0]'>Saved Events</h2>
                      <p className='text-[#a89060]'>Events you bookmarked for later.</p>
                    </div>
                    <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{savedEvents.length} items</span>
                  </div>
                  <div className='flex gap-4 overflow-x-auto pb-3'>
                    {savedEvents.map((ev) => (
                      <article key={ev.id} className='min-w-[280px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] p-4 space-y-2'>
                        <h3 className='text-xl font-bold text-[#fff3b0]'>{ev.title}</h3>
                        <p className='text-sm text-[#a89060]'>{ev.eventType}</p>
                        <p className='text-sm text-[#a89060]'>{ev.venue}</p>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-xs text-[#8b7355]'>{ev.sdate ? new Date(ev.sdate).toLocaleDateString() : ''}</p>
                          <span className='border border-[#fff3b0] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#fff3b0]'>{ev.price || 'Free'}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {isSelfProfile && currentUser?.role !== 'professional' ? (
                <div>
                  <div className='mb-4 flex items-end justify-between gap-4'>
                    <div>
                      <h2 className='text-3xl font-bold text-[#fff3b0]'>Events attended</h2>
                      <p className='text-[#a89060]'>Drag sideways to browse your recent activity.</p>
                    </div>
                    <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{attendedEvents.length} items</span>
                  </div>
                  <div className='flex gap-4 overflow-x-auto pb-3'>
                    {attendedEvents.map((event) => (
                      <article key={event.id} className='min-w-[300px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                        <div className='h-44 overflow-hidden'>
                          <img src={event.image} alt={event.title} className='h-full w-full object-cover' />
                        </div>
                        <div className='space-y-2 p-4'>
                          <div className='flex items-center justify-between gap-3'>
                            <h3 className='text-xl font-bold text-[#fff3b0]'>{event.title}</h3>
                            <span className='border border-[#fff3b0] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#fff3b0]'>{event.status}</span>
                          </div>
                          <p className='text-[#a89060]'>{event.location}</p>
                          <p className='text-[#a89060]'>{event.date}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <div className='mb-4 flex items-end justify-between gap-4'>
                  <div>
                    <h2 className='text-3xl font-bold text-[#fff3b0]'>Publications</h2>
                    <p className='text-[#a89060]'>Recent posts, images, and interactions.</p>
                  </div>
                  <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{userPublications.length} items</span>
                </div>
                <div className='flex gap-4 overflow-x-auto pb-3'>
                  {userPublications.length > 0 ? userPublications.map((publication) => (
                    <article key={publication.id} className='min-w-[280px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                      <div className='h-44 overflow-hidden'>
                        <img src={publication.image} alt={publication.caption} className='h-full w-full object-cover' />
                      </div>
                      <div className='space-y-2 p-4'>
                        <h3 className='text-xl font-bold text-[#fff3b0]'>{publication.caption}</h3>
                        <p className='text-[#a89060]'>{publication.location}</p>
                        <div className='flex items-center justify-between text-sm text-[#a89060]'>
                          <span>{publication.likes} likes</span>
                          <span>{(publication.comments as unknown[]).length} comments</span>
                        </div>
                        {publication.eventTitle ? (
                          <p className='text-xs text-[#e09f3e] uppercase tracking-[0.1em]'>{publication.eventTitle}</p>
                        ) : null}
                      </div>
                    </article>
                  )) : (
                    <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>
                      No publications yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
