const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (data: { email: string; username: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request('/auth/me'),

  getChannels: () => request('/channels'),

  createChannel: (name: string, type?: string) =>
    request('/channels', { method: 'POST', body: JSON.stringify({ name, type }) }),

  joinChannel: (id: string) =>
    request(`/channels/${id}/join`, { method: 'POST' }),

  leaveChannel: (id: string) =>
    request(`/channels/${id}/leave`, { method: 'DELETE' }),

  getChannelMembers: (id: string) => request(`/channels/${id}/members`),

  createDM: (userId: string) =>
    request(`/channels/dm/${userId}`, { method: 'POST' }),

  getMessages: (channelId: string, cursor?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    return request(`/messages/channel/${channelId}?${params}`);
  },

  sendMessage: (channelId: string, content: string, parentId?: string) =>
    request('/messages', { method: 'POST', body: JSON.stringify({ channelId, content, parentId }) }),

  searchMessages: (channelId: string, q: string) =>
    request(`/messages/search/${channelId}?q=${encodeURIComponent(q)}`),

  updateProfile: (data: { avatar?: string; bio?: string; status?: string }) =>
    request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  deleteMessage: (id: string) =>
    request(`/messages/${id}`, { method: 'DELETE' }),

  searchUsers: (q: string) => request(`/users/search?q=${encodeURIComponent(q)}`),

  getUser: (id: string) => request(`/users/${id}`),
};
