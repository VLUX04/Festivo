import React from 'react';
import { AUTH_CHANGED_EVENT, getAuthToken, getStoredUser } from './auth';

const API_BASE_URL = 'http://localhost:3000';

export type CommunityComment = {
  id: number;
  author: string;
  body: string;
  timestamp: string;
};

export type CommunityPost = {
  id: number;
  author: string;
  avatar: string;
  image: string;
  mediaType: 'image' | 'video';
  caption: string;
  location: string;
  likes: number;
  comments: CommunityComment[];
  favorites: number;
  shares: number;
  likedByMe: boolean;
  favoritedByMe: boolean;
  sharedByMe: boolean;
  isMine: boolean;
};

export type CommunityStory = {
  id: number;
  author: string;
  avatar: string;
  image: string;
  label: string;
};

export type AttendedEvent = {
  id: number;
  title: string;
  image: string;
  location: string;
  date: string;
  status: string;
};

export type CommunityState = {
  stories: CommunityStory[];
  posts: CommunityPost[];
  attendedEvents: AttendedEvent[];
};

type CommunityFeedResponse = {
  stories: CommunityStory[];
  posts: Array<CommunityPost & { comments: CommunityComment[] | string }>; 
  attendedEvents: AttendedEvent[];
};

type ShareableItemType = 'publication' | 'event';

export type FriendContact = {
  chatId: number;
  username: string;
  name: string;
  role: string;
};

const inferMediaType = (mediaUrl: string): 'image' | 'video' => {
  const lowered = mediaUrl.toLowerCase();

  if (lowered.endsWith('.mp4') || lowered.endsWith('.webm') || lowered.endsWith('.ogg')) {
    return 'video';
  }

  return 'image';
};

const seedState = (): CommunityState => ({
  stories: [
    {
      id: 1,
      author: 'Marina Silva',
      avatar: 'https://picsum.photos/seed/story-1/100/100',
      image: 'https://picsum.photos/seed/story-1-cover/600/900',
      label: 'Opening night',
    },
    {
      id: 2,
      author: 'Rui Costa',
      avatar: 'https://picsum.photos/seed/story-2/100/100',
      image: 'https://picsum.photos/seed/story-2-cover/600/900',
      label: 'Backstage',
    },
    {
      id: 3,
      author: getStoredUser()?.name || getStoredUser()?.username || 'You',
      avatar: 'https://picsum.photos/seed/story-3/100/100',
      image: 'https://picsum.photos/seed/story-3-cover/600/900',
      label: 'My night out',
    },
  ],
  posts: [
    {
      id: 1,
      author: getStoredUser()?.name || getStoredUser()?.username || 'You',
      avatar: 'https://picsum.photos/seed/post-avatar-1/120/120',
      image: 'https://picsum.photos/seed/post-1/900/800',
      mediaType: 'image',
      caption: 'Golden lights, loud drums, and the best crowd I have seen all year.',
      location: 'Porto, Portugal',
      likes: 142,
      comments: [
        {
          id: 1,
          author: 'Nina',
          body: 'This looks unforgettable.',
          timestamp: new Date().toISOString(),
        },
      ],
      favorites: 28,
      shares: 14,
      likedByMe: false,
      favoritedByMe: false,
      sharedByMe: false,
      isMine: true,
    },
    {
      id: 2,
      author: 'Luna Stage',
      avatar: 'https://picsum.photos/seed/post-avatar-2/120/120',
      image: 'https://picsum.photos/seed/post-2/900/800',
      mediaType: 'image',
      caption: 'Soundcheck finished. The crowd is in for a long night.',
      location: 'Lisbon, Portugal',
      likes: 87,
      comments: [],
      favorites: 19,
      shares: 10,
      likedByMe: false,
      favoritedByMe: false,
      sharedByMe: false,
      isMine: false,
    },
    {
      id: 3,
      author: 'Atlas Collective',
      avatar: 'https://picsum.photos/seed/post-avatar-3/120/120',
      image: 'https://picsum.photos/seed/post-3/900/800',
      mediaType: 'image',
      caption: 'New mural, new music, same old city magic.',
      location: 'Coimbra, Portugal',
      likes: 64,
      comments: [
        {
          id: 2,
          author: 'Ana',
          body: 'This color palette is stunning.',
          timestamp: new Date().toISOString(),
        },
      ],
      favorites: 9,
      shares: 5,
      likedByMe: false,
      favoritedByMe: false,
      sharedByMe: false,
      isMine: false,
    },
  ],
  attendedEvents: [
    {
      id: 1,
      title: 'Summer Jazz Session',
      image: 'https://picsum.photos/seed/attended-1/700/500',
      location: 'Riverside Hall',
      date: 'May 12, 2026',
      status: 'Attended',
    },
    {
      id: 2,
      title: 'Street Art Parade',
      image: 'https://picsum.photos/seed/attended-2/700/500',
      location: 'Downtown Avenue',
      date: 'May 18, 2026',
      status: 'Attended',
    },
    {
      id: 3,
      title: 'Open-Air Cinema',
      image: 'https://picsum.photos/seed/attended-3/700/500',
      location: 'City Park',
      date: 'May 24, 2026',
      status: 'Saved for later',
    },
  ],
});

export const emptyCommunityState: CommunityState = {
  stories: [],
  posts: [],
  attendedEvents: [],
};

let currentState: CommunityState = seedState();
const listeners = new Set<() => void>();

const emitChange = (): void => {
  listeners.forEach((listener) => listener());
};

const setCurrentState = (nextState: CommunityState): void => {
  currentState = nextState;
  emitChange();
};

const authHeaders = (): HeadersInit | null => {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const requestJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
};

const normalizeFeed = (feed: CommunityFeedResponse): CommunityState => ({
  stories: feed.stories || [],
  posts: (feed.posts || []).map((post) => ({
    ...post,
    mediaType: post.mediaType || inferMediaType(post.image),
    comments: Array.isArray(post.comments) ? post.comments : [],
  })),
  attendedEvents: feed.attendedEvents || [],
});

const loadFeedFromServer = async (): Promise<void> => {
  const headers = authHeaders();

  try {
    const init: RequestInit | undefined = headers
      ? { headers }
      : undefined;

    const data = await requestJson<{ feed: CommunityFeedResponse }>('/social/feed', init);
    setCurrentState(normalizeFeed(data.feed));
  } catch {
    // If the server call fails (network, CORS, or server error), keep a sensible seeded feed
    setCurrentState(seedState());
  }
};

const updatePostOptimistically = (postId: number, updater: (post: CommunityPost) => CommunityPost): void => {
  setCurrentState({
    ...currentState,
    posts: currentState.posts.map((post) => (post.id === postId ? updater(post) : post)),
  });
};

export const useCommunityState = (): CommunityState => {
  const state = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => currentState,
    () => seedState(),
  );

  React.useEffect(() => {
    void loadFeedFromServer();

    const refresh = () => {
      void loadFeedFromServer();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return state;
};

export const refreshCommunityState = (): Promise<void> => loadFeedFromServer();

export const fetchFriendContacts = async (): Promise<FriendContact[]> => {
  const headers = authHeaders();

  if (!headers) {
    return [];
  }

  try {
    const data = await requestJson<{ chats: FriendContact[] }>('/chat/friends', { headers });
    return data.chats || [];
  } catch {
    return [];
  }
};

export const createPost = (payload: { caption: string; image: string; location?: string; mediaType?: 'image' | 'video' }): void => {
  const optimisticPost: CommunityPost = {
    id: Date.now(),
    author: getStoredUser()?.name || getStoredUser()?.username || 'You',
    avatar: `https://picsum.photos/seed/user-${Date.now()}/120/120`,
    image: payload.image,
    mediaType: payload.mediaType || inferMediaType(payload.image),
    caption: payload.caption,
    location: payload.location || 'My feed',
    likes: 0,
    comments: [],
    favorites: 0,
    shares: 0,
    likedByMe: false,
    favoritedByMe: false,
    sharedByMe: false,
    isMine: true,
  };

  setCurrentState({
    ...currentState,
    posts: [optimisticPost, ...currentState.posts],
  });

  const headers = authHeaders();
  if (!headers) {
    return;
  }

  void requestJson('/social/publications', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(() => loadFeedFromServer())
    .catch(() => undefined);
};

export const togglePostLike = (postId: number): void => {
  const post = currentState.posts.find((entry) => entry.id === postId);

  if (!post) {
    return;
  }

  const nextLiked = !post.likedByMe;
  updatePostOptimistically(postId, (entry) => ({
    ...entry,
    likedByMe: nextLiked,
    likes: Math.max(0, entry.likes + (nextLiked ? 1 : -1)),
  }));

  const headers = authHeaders();
  if (!headers) {
    return;
  }

  void requestJson(`/social/publications/${postId}/like`, {
    method: 'POST',
    headers,
  })
    .then(() => loadFeedFromServer())
    .catch(() => undefined);
};

export const togglePostFavorite = (postId: number): void => {
  const post = currentState.posts.find((entry) => entry.id === postId);

  if (!post) {
    return;
  }

  const nextFavorited = !post.favoritedByMe;
  updatePostOptimistically(postId, (entry) => ({
    ...entry,
    favoritedByMe: nextFavorited,
    favorites: Math.max(0, entry.favorites + (nextFavorited ? 1 : -1)),
  }));

  const headers = authHeaders();
  if (!headers) {
    return;
  }

  void requestJson(`/social/publications/${postId}/favorite`, {
    method: 'POST',
    headers,
  })
    .then(() => loadFeedFromServer())
    .catch(() => undefined);
};

export const sharePost = (postId: number): Promise<void> => {
  updatePostOptimistically(postId, (entry) => ({
    ...entry,
    shares: entry.shares + 1,
    sharedByMe: true,
  }));

  const headers = authHeaders();
  if (!headers) {
    return Promise.resolve();
  }

  return requestJson(`/social/publications/${postId}/share`, {
    method: 'POST',
    headers,
  })
    .then(() => loadFeedFromServer())
    .catch(() => undefined);
};

export const addCommentToPost = (postId: number, body: string): void => {
  const trimmed = body.trim();

  if (!trimmed) {
    return;
  }

  updatePostOptimistically(postId, (entry) => ({
    ...entry,
    comments: [
      ...entry.comments,
      {
        id: Date.now(),
        author: getStoredUser()?.name || getStoredUser()?.username || 'You',
        body: trimmed,
        timestamp: new Date().toISOString(),
      },
    ],
  }));

  const headers = authHeaders();
  if (!headers) {
    return;
  }

  void requestJson(`/social/publications/${postId}/comments`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: trimmed }),
  })
    .then(() => loadFeedFromServer())
    .catch(() => undefined);
};

export const shareItemWithFriend = (payload: {
  friendUsername: string;
  itemType: ShareableItemType;
  itemId: number;
  title: string;
  url: string;
  body?: string;
}): Promise<void> => {
  const headers = authHeaders();

  if (!headers) {
    return Promise.resolve();
  }

  return requestJson('/chat/share', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(() => undefined);
};

