import type { Event } from '../components/event';
import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:3000';
const FALLBACK_IMAGE = 'https://picsum.photos/seed/festivo-default/900/500';

type EventApiRecord = {
  id: number;
  title: string | null;
  eventType: string | null;
  venue: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  sdate: string | null;
  edate: string | null;
  eventTime: string | null;
  target: string | null;
  description: string | null;
  price: string | null;
  promoter: string | null;
  src: string | null;
  alt: string | null;
  attendingCount: number | string | null;
};

export type EventCreatePayload = {
  title: string;
  eventType: string;
  venue: string;
  latitude: number;
  longitude: number;
  sdate: string;
  edate: string;
  eventTime: string;
  target?: string;
  description: string;
  price?: string;
  imageUrl?: string;
  imageAlt?: string;
};

const formatDate = (dateValue: string | null): string => {
  if (!dateValue) {
    return 'Date TBD';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

export const mapEventApiRecord = (event: EventApiRecord): Event => ({
  src: event.src || FALLBACK_IMAGE,
  alt: event.alt || event.title || 'Event cover',
  type: event.eventType || 'Event',
  date: event.sdate && event.edate && event.sdate !== event.edate
    ? `${formatDate(event.sdate)} - ${formatDate(event.edate)}`
    : formatDate(event.sdate),
  title: event.title || event.description || 'Untitled event',
  promoter: event.promoter || 'Festivo',
  description: event.description || '',
  location: event.venue || 'Location TBD',
  latitude: event.latitude === null ? undefined : Number(event.latitude),
  longitude: event.longitude === null ? undefined : Number(event.longitude),
  time: event.eventTime || 'All day',
  attending: `${Number(event.attendingCount || 0)} people attending`,
  friendsGoing: [],
  price: event.price || 'Free',
});

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to load events');
  }

  return (data.events as EventApiRecord[]).map(mapEventApiRecord);
};

export const createEvent = async (payload: EventCreatePayload): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You need to be logged in to create an event');
  }

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create event');
  }
};