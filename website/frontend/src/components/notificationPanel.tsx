import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';

const API_BASE_URL = 'http://localhost:3000';

type Notification = {
  id: number;
  kind: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actorUsername: string;
  actorName: string;
  publicationId: number | null;
  eventId: number | null;
};

const kindIcon: Record<string, string> = {
  like: '♥',
  comment: '💬',
  share: '↗',
  favorite: '★',
  follow: '➕',
  friend_request: '👤',
  friend_accept: '✓',
};

type Props = {
  onClose: () => void;
};

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);

  const refresh = React.useCallback(async () => {
    const token = getAuthToken();
    if (!token) { setUnreadCount(0); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    const interval = setInterval(() => { void refresh(); }, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unreadCount, refresh };
};

const NotificationPanel: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }

    fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifications(data.notifications as Notification[]);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    const token = getAuthToken();
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n: Notification) => {
    const token = getAuthToken();
    if (token && !n.isRead) {
      await fetch(`${API_BASE_URL}/notifications/${n.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    }

    if (n.eventId) navigate(`/events?eventId=${n.eventId}`);
    else if (n.actorUsername) navigate(`/profile/${n.actorUsername}`);
    onClose();
  };

  return (
    <div className='absolute right-0 top-full mt-2 w-80 border-2 border-[#fff3b0] bg-[#1a0f10] shadow-[8px_8px_0_0_#0a0505] z-[9999]'>
      <div className='flex items-center justify-between border-b border-[#483d30] px-4 py-3'>
        <h3 className='font-bold text-[#fff3b0]'>Notifications</h3>
        <button
          type='button'
          onClick={() => void markAllRead()}
          className='text-xs text-[#a89060] hover:text-[#fff3b0] transition'
        >
          Mark all read
        </button>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        {loading ? (
          <p className='px-4 py-6 text-center text-[#a89060]'>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className='px-4 py-6 text-center text-[#a89060]'>No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type='button'
              onClick={() => void handleClick(n)}
              className={`w-full text-left px-4 py-3 border-b border-[#483d30] transition hover:bg-[#2a1814] flex gap-3 items-start ${n.isRead ? 'opacity-60' : ''}`}
            >
              <span className='text-[#e09f3e] text-lg shrink-0 w-6 text-center'>{kindIcon[n.kind] ?? '•'}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-[#fff3b0] leading-tight'>{n.title}</p>
                <p className='text-xs text-[#a89060] mt-1 leading-tight'>{n.message}</p>
                <p className='text-[10px] text-[#8b7355] mt-1'>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead ? <span className='w-2 h-2 rounded-full bg-[#e09f3e] shrink-0 mt-1' /> : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
