import React from 'react';
import PageLayout from '../components/pageLayout';
import {
  addCommentToPost,
  clearNotifications,
  createPost,
  markAllNotificationsRead,
  sharePost,
  simulateIncomingFollow,
  simulateIncomingLike,
  togglePostFavorite,
  togglePostLike,
  useCommunityState,
} from '../utils/community.ts';

const SocialPage: React.FC = () => {
  const { stories, posts, notifications } = useCommunityState();
  const [composerCaption, setComposerCaption] = React.useState('');
  const [composerLocation, setComposerLocation] = React.useState('');
  const [composerImage, setComposerImage] = React.useState('');
  const [commentDrafts, setCommentDrafts] = React.useState<Record<number, string>>({});

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleComposerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setComposerImage(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePublication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!composerCaption.trim() || !composerImage) {
      return;
    }

    createPost({
      caption: composerCaption.trim(),
      image: composerImage,
      location: composerLocation.trim() || 'Festivo Feed',
    });

    setComposerCaption('');
    setComposerLocation('');
    setComposerImage('');
  };

  const handleCommentSubmit = (postId: number) => {
    const draft = commentDrafts[postId] || '';
    addCommentToPost(postId, draft);
    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: '',
    }));
  };

  const handleSharePost = async (postId: number, caption: string) => {
    sharePost(postId);

    const shareText = `Check out this Festivo post: ${caption}`;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // Clipboard access can fail in restricted contexts; the share count still updates.
      }
    }
  };

  return (
    <PageLayout>
      <div className='mx-auto w-[82%] py-8'>
        <div className='grid gap-8 xl:grid-cols-[2fr_1fr]'>
          <section className='space-y-6'>
            <div className='border-4 border-[#fff3b0] bg-[#1a0f10] p-6'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h1 className='text-5xl font-bold text-[#fff3b0]'>SOCIAL</h1>
                  <p className='mt-3 text-[#a89060]'>Stories, publications, likes, comments, shares, and favorites in one feed.</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3 text-right'>
                  <p className='text-sm uppercase tracking-[0.2em] text-[#fff3b0]'>Notifications</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{unreadCount}</p>
                </div>
              </div>
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

              <div className='border-2 border-[#483d30] bg-[#120707] p-4'>
                <label className='block cursor-pointer text-sm text-[#a89060]'>
                  <span className='mb-2 block font-semibold text-[#fff3b0]'>Publication image</span>
                  <input
                    type='file'
                    accept='.png,.jpg,.jpeg,image/png,image/jpeg'
                    onChange={handleComposerImageUpload}
                    className='w-full text-sm text-[#fff3b0] file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-[#fff3b0] file:text-[#540b0e] hover:file:bg-[#e09f3e] cursor-pointer'
                  />
                </label>
                {composerImage ? (
                  <div className='mt-4 overflow-hidden border border-[#483d30]'>
                    <img src={composerImage} alt='Publication preview' className='h-56 w-full object-cover' />
                  </div>
                ) : null}
              </div>

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
                <article key={post.id} className='border-4 border-[#483d30] bg-[#1a0f10] overflow-hidden'>
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

                  <img src={post.image} alt={post.caption} className='h-[420px] w-full object-cover' />

                  <div className='space-y-4 px-5 py-5'>
                    <p className='text-lg leading-8 text-[#f1e2ba]'>{post.caption}</p>

                    <div className='flex flex-wrap gap-3'>
                      <button
                        type='button'
                        onClick={() => togglePostLike(post.id)}
                        className={`border px-4 py-2 font-semibold transition ${post.likedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Like {post.likes}
                      </button>
                      <button
                        type='button'
                        onClick={() => togglePostFavorite(post.id)}
                        className={`border px-4 py-2 font-semibold transition ${post.favoritedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Favorite {post.favorites}
                      </button>
                      <button
                        type='button'
                        onClick={() => void handleSharePost(post.id, post.caption)}
                        className={`border px-4 py-2 font-semibold transition ${post.sharedByMe ? 'border-[#fff3b0] bg-[#fff3b0] text-[#540b0e]' : 'border-[#483d30] text-[#fff3b0] hover:border-[#fff3b0]'}`}
                      >
                        Share {post.shares}
                      </button>
                    </div>

                    <div className='space-y-3 border-t border-[#483d30] pt-4'>
                      {post.comments.map((comment) => (
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
                          value={commentDrafts[post.id] || ''}
                          onChange={(event) => setCommentDrafts((previous) => ({
                            ...previous,
                            [post.id]: event.target.value,
                          }))}
                          placeholder='Write a comment...'
                          className='flex-1 border-2 border-[#483d30] bg-[#120707] px-4 py-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
                        />
                        <button
                          type='button'
                          onClick={() => handleCommentSubmit(post.id)}
                          className='border-2 border-[#fff3b0] px-4 py-3 font-semibold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#540b0e]'
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className='space-y-6'>
            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-6'>
              <h2 className='text-3xl font-extrabold text-[#f6e8ab]'>Community Signals</h2>
              <p className='mt-2 text-[#a89060]'>Trigger incoming follows and likes to populate the notification drawer.</p>

              <div className='mt-5 space-y-3'>
                <button
                  type='button'
                  onClick={() => simulateIncomingFollow('jazzmaster')}
                  className='w-full border-2 border-[#fff3b0] px-4 py-3 font-semibold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#540b0e]'
                >
                  Follow sample artist
                </button>
                <button
                  type='button'
                  onClick={() => simulateIncomingLike(posts[0]?.caption || 'your post', 'Sofia')}
                  className='w-full border-2 border-[#483d30] px-4 py-3 font-semibold text-[#fff3b0] transition hover:border-[#fff3b0]'
                >
                  Like a sample post
                </button>
              </div>

              <div className='mt-5 grid grid-cols-3 gap-3 text-center'>
                <div className='border border-[#483d30] bg-[#120707] p-3'>
                  <p className='text-sm text-[#a89060]'>Posts</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.length}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] p-3'>
                  <p className='text-sm text-[#a89060]'>Stories</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{stories.length}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] p-3'>
                  <p className='text-sm text-[#a89060]'>Unread</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{unreadCount}</p>
                </div>
              </div>
            </div>

            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-6'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-3xl font-extrabold text-[#f6e8ab]'>Notifications</h2>
                <button
                  type='button'
                  onClick={() => markAllNotificationsRead()}
                  className='text-sm text-[#a89060] transition hover:text-[#fff3b0]'
                >
                  Mark read
                </button>
              </div>

              <div className='mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1'>
                {notifications.length > 0 ? notifications.slice(0, 6).map((notification) => (
                  <div key={notification.id} className='border border-[#483d30] bg-[#120707] p-3 text-sm'>
                    <div className='flex items-center justify-between gap-3'>
                      <span className='font-semibold text-[#fff3b0]'>{notification.title}</span>
                      {!notification.read ? <span className='h-2 w-2 rounded-full bg-[#e09f3e]' /> : null}
                    </div>
                    <p className='mt-2 text-[#a89060]'>{notification.message}</p>
                  </div>
                )) : (
                  <div className='border border-[#483d30] bg-[#120707] p-3 text-[#a89060]'>
                    Your notification drawer is empty.
                  </div>
                )}
              </div>

              <button
                type='button'
                onClick={() => clearNotifications()}
                className='mt-4 w-full border-2 border-[#483d30] px-4 py-3 font-semibold text-[#fff3b0] transition hover:border-[#fff3b0]'
              >
                Clear notifications
              </button>
            </div>

            <div className='border-4 border-[#483d30] bg-[#1a0f10] p-6'>
              <h2 className='text-3xl font-extrabold text-[#f6e8ab]'>Trending Pulse</h2>
              <div className='mt-5 space-y-3'>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Shared today</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.reduce((count, post) => count + post.shares, 0)}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Favorites saved</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.reduce((count, post) => count + post.favorites, 0)}</p>
                </div>
                <div className='border border-[#483d30] bg-[#120707] px-4 py-3'>
                  <p className='text-[#bf9a57]'>Comments posted</p>
                  <p className='text-2xl font-bold text-[#fff3b0]'>{posts.reduce((count, post) => count + post.comments.length, 0)}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default SocialPage;
