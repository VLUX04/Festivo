import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import {
  addCommentToPost,
  createPost,
  fetchFriendContacts,
  refreshCommunityState,
  shareItemWithFriend,
  sharePost,
  togglePostFavorite,
  togglePostLike,
  useCommunityState,
  type CommunityPost,
  type FriendContact,
} from '../utils/community.ts';
import { AUTH_CHANGED_EVENT, isAuthenticated } from '../utils/auth';

const SocialPage: React.FC = () => {
  const { stories, posts } = useCommunityState();
  const [composerCaption, setComposerCaption] = React.useState('');
  const [composerLocation, setComposerLocation] = React.useState('');
  const [composerImage, setComposerImage] = React.useState('');
  const [composerMediaType, setComposerMediaType] = React.useState<'image' | 'video'>('image');
  const [commentDrafts, setCommentDrafts] = React.useState<Record<number, string>>({});
  const [selectedPost, setSelectedPost] = React.useState<CommunityPost | null>(null);
  const [selectedVideoId, setSelectedVideoId] = React.useState<number | null>(null);
  const [friendContacts, setFriendContacts] = React.useState<FriendContact[]>([]);
  const [selectedFriendUsername, setSelectedFriendUsername] = React.useState('');
  const [modalCommentDraft, setModalCommentDraft] = React.useState('');
  const videoRefs = React.useRef(new Map<number, HTMLVideoElement | null>());
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = React.useState<boolean>(isAuthenticated());

  React.useEffect(() => {
    const update = () => setIsLogged(isAuthenticated());
    window.addEventListener(AUTH_CHANGED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  React.useEffect(() => {
    void refreshCommunityState();
  }, []);

  React.useEffect(() => {
    void fetchFriendContacts().then((contacts) => {
      setFriendContacts(contacts);
      setSelectedFriendUsername((current) => current || contacts[0]?.username || '');
    });
  }, []);

  React.useEffect(() => {
    if (!selectedPost) {
      setModalCommentDraft('');
      return;
    }

    const nextDraft = commentDrafts[selectedPost.id] || '';
    setModalCommentDraft(nextDraft);
  }, [commentDrafts, selectedPost]);

  React.useEffect(() => {
    if (selectedVideoId === null) {
      videoRefs.current.forEach((video) => {
        video?.pause();
      });
    }
  }, [selectedVideoId]);

  const handleComposerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    setComposerMediaType(mediaType);

    const reader = new FileReader();
    reader.onload = () => {
      setComposerImage(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePublication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLogged) {
      navigate('/login');
      return;
    }

    if (!composerCaption.trim() || !composerImage) {
      return;
    }

    createPost({
      caption: composerCaption.trim(),
      image: composerImage,
      mediaType: composerMediaType,
      location: composerLocation.trim() || 'Festivo Feed',
    });

    setComposerCaption('');
    setComposerLocation('');
    setComposerImage('');
    setComposerMediaType('image');
  };

  const openPublication = (post: CommunityPost) => {
    setSelectedPost(post);
    setCommentDrafts((previous) => ({
      ...previous,
      [post.id]: previous[post.id] || '',
    }));
  };

  const closePublication = () => {
    setSelectedPost(null);
    setSelectedVideoId(null);
  };

  const pauseAllOtherVideos = (activeId: number) => {
    videoRefs.current.forEach((video, videoId) => {
      if (videoId !== activeId) {
        video?.pause();
      }
    });
  };

  const toggleVideoPlayback = async (postId: number) => {
    const video = videoRefs.current.get(postId);

    if (!video) {
      return;
    }

    pauseAllOtherVideos(postId);

    if (selectedVideoId === postId && !video.paused) {
      video.pause();
      setSelectedVideoId(null);
      return;
    }

    try {
      await video.play();
      setSelectedVideoId(postId);
    } catch {
      setSelectedVideoId(null);
    }
  };

  const handleCommentSubmit = (postId: number, draft: string) => {
    if (!isLogged) {
      navigate('/login');
      return;
    }

    addCommentToPost(postId, draft);
    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: '',
    }));

    if (selectedPost?.id === postId) {
      setModalCommentDraft('');
    }
  };

  const handleModalCommentSubmit = () => {
    if (!selectedPost) {
      return;
    }

    handleCommentSubmit(selectedPost.id, modalCommentDraft);
  };

  const handleShareToFriend = async () => {
    if (!selectedPost) {
      return;
    }

    if (!selectedFriendUsername.trim()) {
      return;
    }

    await shareItemWithFriend({
      friendUsername: selectedFriendUsername.trim(),
      itemType: 'publication',
      itemId: selectedPost.id,
      title: selectedPost.caption,
      url: `/social?postId=${selectedPost.id}`,
      body: selectedPost.caption,
    });

    await sharePost(selectedPost.id);

    await refreshCommunityState();
  };

  return (
    <PageLayout>
      <div className='mx-auto w-[82%] py-8'>
        <div className='grid gap-8 xl:grid-cols-[2fr_1fr]'>
          <section className='space-y-6'>
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <h1 className='text-5xl font-bold text-[#fff3b0]'>SOCIAL</h1>
              <p className='mt-3 text-[#a89060]'>Stories, publications, comments, shares, and favorites in one feed.</p>
            </div>

            <form onSubmit={handleCreatePublication} className='border-4 border-[#483d30] bg-[#1a0f10] p-6 space-y-4'>
              <div className='flex flex-col gap-4 md:flex-row'>
                <input
                  type='text'
                  value={composerCaption}
                  onChange={(event) => setComposerCaption(event.target.value)}
                  placeholder='Share a new publication...'
                  className='flex-1 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                />
                <input
                  type='text'
                  value={composerLocation}
                  onChange={(event) => setComposerLocation(event.target.value)}
                  placeholder='Location'
                  className='md:w-64 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-[1fr_auto]'>
                <label className='block cursor-pointer text-sm text-[#a89060] border-2 border-[#483d30] bg-[#120707] p-4'>
                  <span className='mb-2 block font-semibold text-[#fff3b0]'>Publication media</span>
                  <input
                    type='file'
                    accept='.png,.jpg,.jpeg,.mp4,.webm,.ogg,image/png,image/jpeg,video/mp4,video/webm,video/ogg'
                    onChange={handleComposerImageUpload}
                    className='w-full text-sm text-[#fff3b0] file:mr-4 file:border-0 file:bg-[#fff3b0] file:px-4 file:py-2 file:text-[#540b0e] hover:file:bg-[#e09f3e] cursor-pointer'
                  />
                </label>
                <div className='flex items-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setComposerMediaType('image')}
                    className={`border px-4 py-3 font-semibold transition ${composerMediaType === 'image' ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                  >
                    Image
                  </button>
                  <button
                    type='button'
                    onClick={() => setComposerMediaType('video')}
                    className={`border px-4 py-3 font-semibold transition ${composerMediaType === 'video' ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {composerImage ? (
                <div className='overflow-hidden border border-[#483d30] bg-[#120707]'>
                  {composerMediaType === 'video' ? (
                    <video src={composerImage} className='h-56 w-full object-cover' controls muted />
                  ) : (
                    <img src={composerImage} alt='Publication preview' className='h-56 w-full object-cover' />
                  )}
                </div>
              ) : null}

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='border-2 border-[#fff3b0] bg-[#fff3b0] px-5 py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0]'
                >
                  Publish
                </button>
              </div>
            </form>

            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-4'>
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {stories.map((story) => (
                  <article key={story.id} className='min-w-[170px] max-w-[170px] flex-shrink-0 border border-[#483d30] bg-[#120707] p-3'>
                    <div className='relative h-56 overflow-hidden'>
                      <img src={story.image} alt={story.label} className='h-full w-full object-cover' />
                      <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0506] to-transparent p-3'>
                        <p className='text-sm font-bold text-[#fff3b0]'>{story.label}</p>
                      </div>
                    </div>
                    <div className='mt-3 flex items-center gap-3'>
                      <img src={story.avatar} alt={story.author} className='h-10 w-10 rounded-full object-cover' />
                      <div>
                        <p className='text-sm font-semibold text-[#fff3b0]'>{story.author}</p>
                        <p className='text-xs text-[#a89060]'>Story</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className='space-y-6'>
              {posts.map((post) => (
                <article key={post.id} className='overflow-hidden border-4 border-[#483d30] bg-[#1a0f10]'>
                  <div className='flex items-center gap-3 border-b border-[#483d30] px-5 py-4'>
                    <img src={post.avatar} alt={post.author} className='h-12 w-12 rounded-full object-cover' />
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <h3 className='text-xl font-bold text-[#fff3b0]'>{post.author}</h3>
                        {post.isMine ? (
                          <span className='border border-[#fff3b0] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#fff3b0]'>Your post</span>
                        ) : null}
                      </div>
                      <p className='text-sm text-[#a89060]'>{post.location}</p>
                    </div>
                  </div>

                  <div className='relative bg-[#120707]'>
                    {post.mediaType === 'video' ? (
                      <>
                        <video
                          ref={(node) => {
                            videoRefs.current.set(post.id, node);
                          }}
                          src={post.image}
                          className='h-[420px] w-full object-cover'
                          playsInline
                          preload='metadata'
                          muted
                          loop
                          onClick={() => void toggleVideoPlayback(post.id)}
                        />
                        <button
                          type='button'
                          onClick={() => void toggleVideoPlayback(post.id)}
                          className='absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35'
                        >
                          <span className='border-2 border-white bg-black/70 px-4 py-2 text-sm font-bold text-white'>
                            {selectedVideoId === post.id ? 'Pause' : 'Play'}
                          </span>
                        </button>
                      </>
                    ) : (
                      <img src={post.image} alt={post.caption} className='h-[420px] w-full object-cover' />
                    )}
                  </div>

                  <div className='space-y-4 px-5 py-5'>
                    <p className='text-lg leading-8 text-[#f1e2ba]'>{post.caption}</p>

                    <div className='flex flex-wrap gap-3'>
                      <button
                        type='button'
                        onClick={() => { if (!isLogged) { navigate('/login'); return; } togglePostLike(post.id); }}
                        className={`border px-4 py-2 font-semibold transition ${post.likedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Like {post.likes}
                      </button>
                      <button
                        type='button'
                        onClick={() => { if (!isLogged) { navigate('/login'); return; } togglePostFavorite(post.id); }}
                        className={`border px-4 py-2 font-semibold transition ${post.favoritedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Favorite {post.favorites}
                      </button>
                      <button
                        type='button'
                        onClick={() => openPublication(post)}
                        className='border px-4 py-2 font-semibold text-[#fff3b0] transition hover:border-[#fff3b0]'
                      >
                        Comments {post.comments.length}
                      </button>
                      <button
                        type='button'
                        onClick={() => openPublication(post)}
                        className={`border px-4 py-2 font-semibold transition ${post.sharedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Share {post.shares}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className='space-y-6'>
            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-6'>
              <h2 className='text-3xl font-extrabold text-[#f6e8ab]'>Feed Stats</h2>
              <div className='mt-5 space-y-3'>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Posts</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.length}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Stories</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{stories.length}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Shared</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.reduce((count, post) => count + post.shares, 0)}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedPost ? (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0506]/80 px-4 py-8 backdrop-blur-sm'>
          <div className='max-h-[90vh] w-full max-w-4xl overflow-y-auto border-4 border-[#fff3b0] bg-[#1a0f10] shadow-[0_20px_80px_rgba(0,0,0,0.55)]'>
            <div className='relative'>
              {selectedPost.mediaType === 'video' ? (
                <video
                  ref={(node) => {
                    videoRefs.current.set(selectedPost.id, node);
                  }}
                  src={selectedPost.image}
                  className='h-72 w-full object-cover'
                  playsInline
                  preload='metadata'
                  muted
                  loop
                  onClick={() => void toggleVideoPlayback(selectedPost.id)}
                />
              ) : (
                <img src={selectedPost.image} alt={selectedPost.caption} className='h-72 w-full object-cover' />
              )}
              <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0506] to-transparent px-6 py-5'>
                <span className='inline-flex border border-[#fff3b0] bg-[#1a0f10]/80 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>
                  Publication
                </span>
              </div>
              <button
                type='button'
                onClick={closePublication}
                className='absolute right-4 top-4 h-10 w-10 border border-[#fff3b0] bg-[#1a0f10]/80 text-xl font-bold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10]'
                aria-label='Close publication details'
              >
                ×
              </button>
            </div>

            <div className='space-y-5 px-6 py-6'>
              <div className='space-y-2'>
                <h2 className='text-4xl font-bold text-[#fff3b0]'>{selectedPost.author}</h2>
                <p className='text-lg text-[#a89060]'>{selectedPost.location}</p>
              </div>

              <p className='leading-8 text-[#f1e2ba]'>{selectedPost.caption}</p>

              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={() => { if (!isLogged) { navigate('/login'); return; } togglePostLike(selectedPost.id); }}
                  className={`border px-4 py-2 font-semibold transition ${selectedPost.likedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                >
                  Like {selectedPost.likes}
                </button>
                <button
                  type='button'
                  onClick={() => { if (!isLogged) { navigate('/login'); return; } togglePostFavorite(selectedPost.id); }}
                  className={`border px-4 py-2 font-semibold transition ${selectedPost.favoritedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                >
                  Favorite {selectedPost.favorites}
                </button>
              </div>

              <div className='grid gap-4 md:grid-cols-[1fr_auto]'>
                <label className='flex flex-col gap-2 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-sm text-[#a89060]'>
                  <span className='font-semibold uppercase tracking-[0.2em] text-[#fff3b0]'>Share to friend</span>
                  <select
                    value={selectedFriendUsername}
                    onChange={(event) => setSelectedFriendUsername(event.target.value)}
                    className='bg-transparent text-[#fff3b0] outline-none'
                  >
                    {friendContacts.length === 0 ? (
                      <option value=''>No friends available</option>
                    ) : (
                      friendContacts.map((friend) => (
                        <option key={friend.username} value={friend.username}>
                          {friend.name} (@{friend.username})
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button
                  type='button'
                  onClick={() => void handleShareToFriend()}
                  disabled={!selectedFriendUsername}
                  className='border-2 border-[#fff3b0] px-4 py-3 font-semibold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#540b0e] disabled:cursor-not-allowed disabled:border-[#483d30] disabled:text-[#483d30]'
                >
                  Share to Friend
                </button>
              </div>

              <div className='space-y-3 border-t border-[#483d30] pt-4'>
                <h3 className='text-2xl font-bold text-[#fff3b0]'>Comments</h3>
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className='border border-[#483d30] bg-[#120707] p-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <span className='font-semibold text-[#fff3b0]'>{comment.author}</span>
                      <span className='text-xs text-[#a89060]'>{comment.timestamp}</span>
                    </div>
                    <p className='mt-2 text-[#f1e2ba]'>{comment.body}</p>
                  </div>
                ))}

                <div className='flex gap-3'>
                  <input
                    type='text'
                    value={modalCommentDraft}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setModalCommentDraft(nextValue);
                      setCommentDrafts((previous) => ({
                        ...previous,
                        [selectedPost.id]: nextValue,
                      }));
                    }}
                    placeholder='Write a comment...'
                    className='flex-1 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                  />
                  <button
                    type='button'
                    onClick={handleModalCommentSubmit}
                    className='border-2 border-[#fff3b0] px-4 py-3 font-semibold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#540b0e]'
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
};

export default SocialPage;
