export type Story = {
  name: string;
  image: string;
  isOwn?: boolean;
}

export type Post = {
  author: string;
  venue: string;
  timeAgo: string;
  avatar: string;
  image: string;
}

export type TrendingEvent = {
  rank: number;
  name: string;
  going: number;
}

export type SocialStats = {
  postsToday: number;
  activeUsers: string;
  eventsShared: number;
}

export const stories: Story[] = [
  { name: 'YOUR STORY', image: 'https://picsum.photos/seed/social-story-1/100/100', isOwn: true },
  { name: 'SOFIA A.', image: 'https://picsum.photos/seed/social-story-2/100/100' },
  { name: 'MIGUEL C.', image: 'https://picsum.photos/seed/social-story-3/100/100' },
  { name: 'ANA S.', image: 'https://picsum.photos/seed/social-story-4/100/100' },
  { name: 'JOAO P.', image: 'https://picsum.photos/seed/social-story-5/100/100' },
  { name: 'BEATRIZ M.', image: 'https://picsum.photos/seed/social-story-6/100/100' },
  { name: 'PEDRO R.', image: 'https://picsum.photos/seed/social-story-7/100/100' },
]

export const posts: Post[] = [
  {
    author: 'Sofia Almeida',
    venue: 'Techno Nights at Lux',
    timeAgo: '2h ago',
    avatar: 'https://picsum.photos/seed/social-avatar-1/80/80',
    image: 'https://picsum.photos/seed/social-post-1/1400/900',
  },
  {
    author: 'Miguel Costa',
    venue: 'Art Week Lisboa',
    timeAgo: '5h ago',
    avatar: 'https://picsum.photos/seed/social-avatar-2/80/80',
    image: 'https://picsum.photos/seed/social-post-2/1400/900',
  },
]

export const trendingEvents: TrendingEvent[] = [
  { rank: 1, name: 'Techno Nights @ Lux', going: 234 },
  { rank: 2, name: 'Jazz Festival Porto', going: 189 },
  { rank: 3, name: 'Art Week Lisboa', going: 156 },
]

export const socialStats: SocialStats = {
  postsToday: 87,
  activeUsers: '1.2k',
  eventsShared: 34,
}