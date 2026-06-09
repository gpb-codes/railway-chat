export interface WSMessage {
  type: 'message' | 'join' | 'leave' | 'typing' | 'reaction' | 'dm' | 'online_users';
  content?: string;
  username: string;
  userId: string;
  room?: string;
  toUser?: string;
  emoji?: string;
  messageId?: string;
  timestamp: string;
}

export interface OnlineUser {
  userId: string;
  username: string;
  room: string;
}

type MessageHandler = (msg: WSMessage) => void;
type OnlineHandler = (users: OnlineUser[]) => void;

export class ChatSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Function[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private username: string = '';
  private userId: string = '';

  constructor(url: string) {
    this.url = url;
  }

  connect(username: string, userId: string) {
    this.username = username;
    this.userId = userId;

    const wsUrl = `${this.url}/ws?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WS connected');
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      const lines = event.data.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg: WSMessage = JSON.parse(line);
          if (msg.type === 'online_users') {
            this.emit('online_users', (msg as any).users);
          } else {
            this.emit('message', msg);
          }
        } catch {}
      }
    };

    this.ws.onclose = () => {
      console.log('WS disconnected');
      this.emit('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.username, this.userId);
    }, 3000);
  }

  joinRoom(room: string) {
    this.send({ type: 'join', room });
  }

  leaveRoom(room: string) {
    this.send({ type: 'leave', room });
  }

  sendMessage(room: string, content: string) {
    this.send({ type: 'message', content, room });
  }

  sendDM(toUser: string, content: string) {
    this.send({ type: 'dm', content, toUser });
  }

  sendTyping(room: string) {
    this.send({ type: 'typing', room });
  }

  sendReaction(messageId: string, room: string, emoji: string) {
    this.send({ type: 'reaction', messageId, room, emoji });
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    }
  }

  private emit(event: string, ...args: any[]) {
    this.handlers.get(event)?.forEach(h => h(...args));
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
