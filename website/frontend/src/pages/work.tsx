import React from 'react';
import PageLayout from '../components/pageLayout';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getStoredUser, isProfessionalRole } from '../utils/auth.ts';

const API_BASE_URL = 'http://localhost:3000';

type WorkOpportunity = {
  id: number;
  title: string;
  position: string;
  mode: 'remote' | 'hybrid' | 'onsite';
  duration: 'week' | 'month' | 'contract' | 'ongoing';
  employment: 'part-time' | 'full-time';
  pay: string;
  description: string;
  location: string | null;
  posterUsername: string;
  poster: string;
  posterRole: string;
  createdAt: string;
};

const defaultForm = {
  title: '',
  position: '',
  mode: 'onsite' as const,
  duration: 'month' as const,
  employment: 'full-time' as const,
  pay: '',
  description: '',
  location: '',
};

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const user = React.useMemo(() => getStoredUser(), []);
  const canAccessWork = isProfessionalRole(user?.role);
  const [activeTab, setActiveTab] = React.useState<'browse' | 'post' | 'network'>('browse');
  const [proSearch, setProSearch] = React.useState('');
  const [professionals, setProfessionals] = React.useState<Array<{
    id: number; username: string; name: string; location: string | null; bio: string | null;
    genre: string | null; rating: number | null; isVerified: boolean; followersCount: number;
  }>>([]);
  const [proLoading, setProLoading] = React.useState(false);
  const [opportunities, setOpportunities] = React.useState<WorkOpportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState(defaultForm);
  const [applyingTo, setApplyingTo] = React.useState<number | null>(null);
  const [applyInfo, setApplyInfo] = React.useState('');
  const [applyContact, setApplyContact] = React.useState('');
  const [applyError, setApplyError] = React.useState('');
  const [applySuccess, setApplySuccess] = React.useState<number | null>(null);
  const [applyLoading, setApplyLoading] = React.useState(false);

  React.useEffect(() => {
    if (!canAccessWork) {
      navigate('/events', { replace: true });
    }
  }, [canAccessWork, navigate]);

  React.useEffect(() => {
    let mounted = true;

    const loadOpportunities = async () => {
      try {
        setLoading(true);
        setError('');

        const token = getAuthToken();
        const headers: HeadersInit = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const response = await fetch('http://localhost:3000/work/opportunities', {
          headers,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load opportunities');
        }

        if (mounted) {
          setOpportunities(data.opportunities as WorkOpportunity[]);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load opportunities');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadOpportunities();

    return () => {
      mounted = false;
    };
  }, []);

  if (!canAccessWork) {
    return null;
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = getAuthToken();
    if (!token) {
      setError('You need to be logged in to post an opportunity.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('http://localhost:3000/work/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create work opportunity');
      }

      setFormData(defaultForm);
      setActiveTab('browse');

      const refreshed = await fetch('http://localhost:3000/work/opportunities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const refreshedData = await refreshed.json();
      if (refreshed.ok && refreshedData.success) {
        setOpportunities(refreshedData.opportunities as WorkOpportunity[]);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChat = async (opportunity: WorkOpportunity) => {
    const token = getAuthToken();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const initiateResponse = await fetch(`${API_BASE_URL}/chat/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendUsername: opportunity.posterUsername }),
      });

      const initiateData = await initiateResponse.json();

      if (!initiateResponse.ok || !initiateData.success) {
        throw new Error(initiateData.message || 'Unable to open chat');
      }

      await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: String(initiateData.chatId),
          content: `Hi, I'm interested in your job opportunity: ${opportunity.title}.`,
        }),
      });

      navigate(`/friends?chat=${encodeURIComponent(opportunity.posterUsername)}`);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : 'Unable to open chat');
    }
  };

  const handleApply = async (opportunity: WorkOpportunity) => {
    const token = getAuthToken();
    if (!token) { navigate('/login'); return; }
    if (!applyInfo.trim()) { setApplyError('Please write a brief message.'); return; }

    try {
      setApplyLoading(true);
      setApplyError('');
      const res = await fetch(`${API_BASE_URL}/work/opportunities/${opportunity.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ information: applyInfo.trim(), contact: applyContact.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to apply');
      setApplySuccess(opportunity.id);
      setApplyingTo(null);
      setApplyInfo('');
      setApplyContact('');
    } catch (applyErr) {
      setApplyError(applyErr instanceof Error ? applyErr.message : 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  const searchProfessionalsHandler = async (q: string) => {
    setProLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/work/professionals?q=${encodeURIComponent(q || '%')}`);
      const data = await res.json();
      if (data.success) setProfessionals(data.professionals);
    } catch {
      /* ignore */
    } finally {
      setProLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-8'>
          <div className='text-center space-y-4'>
            <h1 className='text-[#fff3b0] text-5xl font-bold'>JOIN THE CULTURAL WORKFORCE</h1>
            <p className='text-[#a89060] text-xl max-w-4xl mx-auto'>Connect with opportunities, grow your network, and build your career in the arts and culture sector.</p>
          </div>

          <div className='flex flex-col sm:flex-row justify-center gap-4 flex-wrap'>
            <button
              type='button'
              onClick={() => setActiveTab('post')}
              className={`px-6 py-4 text-xl font-bold transition ${activeTab === 'post' ? 'bg-[#fff3b0] text-[#540b0e]' : 'border-2 border-[#fff3b0] text-[#fff3b0]'}`}
            >
              POST A JOB
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-4 text-xl font-bold transition ${activeTab === 'browse' ? 'bg-[#fff3b0] text-[#540b0e]' : 'border-2 border-[#fff3b0] text-[#fff3b0]'}`}
            >
              BROWSE JOBS
            </button>
            <button
              type='button'
              onClick={() => { setActiveTab('network'); if (proSearch === '') void searchProfessionalsHandler('%'); }}
              className={`px-6 py-4 text-xl font-bold transition ${activeTab === 'network' ? 'bg-[#fff3b0] text-[#540b0e]' : 'border-2 border-[#fff3b0] text-[#fff3b0]'}`}
            >
              FIND TALENT
            </button>
            <button
              type='button'
              onClick={() => navigate('/work/create')}
              className='px-6 py-4 text-xl font-bold border-2 border-[#e09f3e] text-[#e09f3e] transition hover:bg-[#e09f3e] hover:text-[#1a0f10]'
            >
              + CREATE EVENT
            </button>
          </div>
        </div>

        {activeTab === 'network' ? (
          <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-6'>
            <div>
              <h2 className='text-4xl font-bold text-[#fff3b0]'>Find Talent</h2>
              <p className='mt-2 text-[#a89060]'>Search DJs, photographers, event managers, and other professionals in the cultural industry.</p>
            </div>
            <div className='flex gap-3'>
              <input
                type='text'
                value={proSearch}
                onChange={(e) => setProSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void searchProfessionalsHandler(proSearch)}
                placeholder='Search by name, genre, location...'
                className='flex-1 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
              />
              <button
                type='button'
                onClick={() => void searchProfessionalsHandler(proSearch)}
                className='border-2 border-[#fff3b0] bg-[#fff3b0] px-6 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0]'
              >
                Search
              </button>
            </div>
            {proLoading ? (
              <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>Searching...</div>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {professionals.map((pro) => (
                  <article key={pro.id} className='border-2 border-[#483d30] bg-[#120707] p-5 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <h3 className='text-xl font-bold text-[#fff3b0]'>{pro.name}</h3>
                        <p className='text-sm text-[#a89060]'>@{pro.username}</p>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        {pro.isVerified ? <span className='border border-[#fff3b0] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[#fff3b0]'>Verified</span> : null}
                        {pro.rating ? <span className='text-[#e09f3e] font-bold text-sm'>★ {pro.rating}/5</span> : null}
                      </div>
                    </div>
                    {pro.genre ? <p className='text-sm text-[#e09f3e]'>{pro.genre}</p> : null}
                    {pro.bio ? <p className='text-sm text-[#a89060] line-clamp-2'>{pro.bio}</p> : null}
                    <div className='flex items-center justify-between gap-3 pt-2 border-t border-[#483d30]'>
                      <div>
                        {pro.location ? <p className='text-xs text-[#8b7355]'>{pro.location}</p> : null}
                        <p className='text-xs text-[#8b7355]'>{pro.followersCount} followers</p>
                      </div>
                      <button
                        type='button'
                        onClick={() => navigate(`/profile/${pro.username}`)}
                        className='border-2 border-[#fff3b0] px-4 py-2 font-bold text-[#fff3b0] text-sm transition hover:bg-[#fff3b0] hover:text-[#540b0e]'
                      >
                        View Profile
                      </button>
                    </div>
                  </article>
                ))}
                {!proLoading && professionals.length === 0 ? (
                  <p className='text-[#a89060] col-span-full'>No professionals found. Try a different search.</p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === 'post' ? (
          <form onSubmit={handleSubmit} className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-6'>
            <div>
              <h2 className='text-4xl font-bold text-[#fff3b0]'>Post a Work Opportunity</h2>
              <p className='mt-2 text-[#a89060]'>Add a role, pay, duration, and a button to chat with the poster later.</p>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <input value={formData.title} onChange={(event) => updateField('title', event.target.value)} required placeholder='Opportunity title' className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
              <input value={formData.position} onChange={(event) => updateField('position', event.target.value)} required placeholder='Position' className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
              <select value={formData.mode} onChange={(event) => updateField('mode', event.target.value)} className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]'>
                <option value='remote'>Remote</option>
                <option value='hybrid'>Hybrid</option>
                <option value='onsite'>Onsite</option>
              </select>
              <select value={formData.duration} onChange={(event) => updateField('duration', event.target.value)} className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]'>
                <option value='week'>Week</option>
                <option value='month'>Month</option>
                <option value='contract'>Contract</option>
                <option value='ongoing'>Ongoing</option>
              </select>
              <select value={formData.employment} onChange={(event) => updateField('employment', event.target.value)} className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]'>
                <option value='part-time'>Part-time</option>
                <option value='full-time'>Full-time</option>
              </select>
              <input value={formData.pay} onChange={(event) => updateField('pay', event.target.value)} required placeholder='Pay' className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0]' />
              <input value={formData.location} onChange={(event) => updateField('location', event.target.value)} placeholder='Location' className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />
              <textarea value={formData.description} onChange={(event) => updateField('description', event.target.value)} required rows={5} placeholder='Description' className='border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] md:col-span-2' />
            </div>

            {error ? <p className='text-[#ff8f8f]'>{error}</p> : null}

            <div className='flex gap-4'>
              <button type='submit' disabled={isSubmitting} className='border-2 border-[#fff3b0] bg-[#fff3b0] px-6 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'>
                {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
              </button>
              <button type='button' onClick={() => navigate('/work')} className='border-2 border-[#483d30] px-6 py-3 font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'>
                Back
              </button>
            </div>
          </form>
        ) : null}

        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 space-y-6'>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <h2 className='text-4xl font-bold text-[#fff3b0]'>Available Opportunities</h2>
              <p className='text-[#a89060]'>Browse roles, check the contract type, and message the poster directly.</p>
            </div>
            <span className='text-[#a89060] uppercase tracking-[0.2em]'>{opportunities.length} listings</span>
          </div>

          {loading ? (
            <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>Loading opportunities...</div>
          ) : null}

          {error && activeTab === 'browse' ? <div className='border-2 border-[#ff6b6b] bg-[#120707] px-4 py-6 text-[#ffb3b3]'>{error}</div> : null}

          <div className='grid gap-6 xl:grid-cols-2'>
            {opportunities.map((opportunity) => (
              <article key={opportunity.id} className='border-2 border-[#483d30] bg-[#120707] p-6 space-y-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-2xl font-bold text-[#fff3b0]'>{opportunity.title}</h3>
                    <p className='text-[#a89060]'>{opportunity.position}</p>
                  </div>
                  <span className='border border-[#fff3b0] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#fff3b0]'>{opportunity.posterRole}</span>
                </div>

                <div className='grid gap-3 md:grid-cols-2 text-[#a89060]'>
                  <p><span className='text-[#fff3b0]'>Mode:</span> {opportunity.mode}</p>
                  <p><span className='text-[#fff3b0]'>Duration:</span> {opportunity.duration}</p>
                  <p><span className='text-[#fff3b0]'>Employment:</span> {opportunity.employment}</p>
                  <p><span className='text-[#fff3b0]'>Pay:</span> {opportunity.pay}</p>
                </div>

                <p className='leading-7 text-[#f1e2ba]'>{opportunity.description}</p>

                <div className='flex items-center justify-between gap-4 border-t border-[#483d30] pt-4'>
                  <div>
                    <p className='text-sm text-[#a89060]'>Posted by</p>
                    <button
                      type='button'
                      onClick={() => navigate(`/profile/${opportunity.posterUsername}`)}
                      className='font-semibold text-[#fff3b0] hover:text-[#e09f3e] transition text-left'
                    >
                      {opportunity.poster}
                    </button>
                    <p className='text-sm text-[#a89060]'>{opportunity.location || 'Location on request'}</p>
                    <button
                      type='button'
                      onClick={() => navigate(`/profile/${opportunity.posterUsername}`)}
                      className='mt-1 text-xs text-[#e09f3e] hover:underline'
                    >
                      View Profile →
                    </button>
                  </div>

                  <div className='flex gap-2'>
                    {applySuccess === opportunity.id ? (
                      <span className='border-2 border-[#90ee90] px-4 py-3 font-bold text-[#90ee90]'>Applied!</span>
                    ) : (
                      <button
                        type='button'
                        onClick={() => { setApplyingTo(applyingTo === opportunity.id ? null : opportunity.id); setApplyError(''); }}
                        className='border-2 border-[#e09f3e] px-4 py-3 font-bold text-[#e09f3e] transition hover:bg-[#e09f3e] hover:text-[#1a0f10]'
                      >
                        Apply
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => void handleOpenChat(opportunity)}
                      className='border-2 border-[#fff3b0] bg-[#fff3b0] px-4 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0]'
                    >
                      Chat with poster
                    </button>
                  </div>
                </div>

                {applyingTo === opportunity.id ? (
                  <div className='border-t border-[#483d30] pt-4 space-y-3'>
                    <h4 className='font-bold text-[#fff3b0]'>Apply for this opportunity</h4>
                    <textarea
                      value={applyInfo}
                      onChange={(e) => setApplyInfo(e.target.value)}
                      rows={3}
                      placeholder='Introduce yourself and explain why you are a good fit...'
                      className='w-full border-2 border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                    />
                    <input
                      type='text'
                      value={applyContact}
                      onChange={(e) => setApplyContact(e.target.value)}
                      placeholder='Contact info (email, phone, portfolio URL...)'
                      className='w-full border-2 border-[#483d30] bg-[#1a0f10] px-3 py-2 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                    />
                    {applyError ? <p className='text-[#ff8f8f] text-sm'>{applyError}</p> : null}
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => void handleApply(opportunity)}
                        disabled={applyLoading}
                        className='border-2 border-[#fff3b0] bg-[#fff3b0] px-4 py-2 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'
                      >
                        {applyLoading ? 'Submitting...' : 'Submit Application'}
                      </button>
                      <button
                        type='button'
                        onClick={() => { setApplyingTo(null); setApplyError(''); }}
                        className='border-2 border-[#483d30] px-4 py-2 font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkPage;
