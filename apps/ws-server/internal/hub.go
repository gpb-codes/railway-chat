package internal

import (
	"encoding/json"
	"log"
	"sync"
	"time"
)

type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool
	broadcast  chan *Message
	Register   chan *Client
	unregister chan *Client
	joinRoom   chan *RoomRequest
	leaveRoom  chan *RoomRequest
	typing     chan *Message
	reaction   chan *Message
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan *Message, 256),
		Register:   make(chan *Client),
		unregister: make(chan *Client),
		joinRoom:   make(chan *RoomRequest),
		leaveRoom:  make(chan *RoomRequest),
		typing:     make(chan *Message, 256),
		reaction:   make(chan *Message, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client] = true
			clientCount := len(h.clients)
			h.mu.Unlock()
			log.Printf("[HUB] + %s connected (total: %d)", client.Username, clientCount)
			h.sendOnlineUsers()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				if client.Room != "" {
					h.removeClientFromRoom(client, client.Room)
				}
				delete(h.clients, client)
				close(client.Send)
				log.Printf("[HUB] - %s disconnected", client.Username)
			}
			h.mu.Unlock()
			h.sendOnlineUsers()

		case req := <-h.joinRoom:
			h.mu.Lock()
			h.handleJoinRoom(req.client, req.room)
			h.mu.Unlock()

		case req := <-h.leaveRoom:
			h.mu.Lock()
			h.removeClientFromRoom(req.client, req.room)
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.handleBroadcast(msg)

		case msg := <-h.typing:
			h.handleTyping(msg)

		case msg := <-h.reaction:
			h.handleReaction(msg)
		}
	}
}

func (h *Hub) handleJoinRoom(client *Client, room string) {
	if client.Room != "" {
		h.removeClientFromRoom(client, client.Room)
	}
	if h.rooms[room] == nil {
		h.rooms[room] = make(map[*Client]bool)
	}
	h.rooms[room][client] = true
	client.Room = room
	log.Printf("[HUB] %s joined room %s", client.Username, room)

	h.broadcastToRoom(room, &Message{
		Type:      MsgTypeJoin,
		Room:      room,
		Username:  client.Username,
		UserID:    client.UserID,
		Content:   client.Username + " joined " + room,
		Timestamp: time.Now().UTC(),
	})
}

func (h *Hub) removeClientFromRoom(client *Client, room string) {
	if h.rooms[room] == nil {
		return
	}
	if _, ok := h.rooms[room][client]; !ok {
		return
	}
	delete(h.rooms[room], client)
	client.Room = ""

	h.broadcastToRoom(room, &Message{
		Type:      MsgTypeLeave,
		Room:      room,
		Username:  client.Username,
		UserID:    client.UserID,
		Content:   client.Username + " left " + room,
		Timestamp: time.Now().UTC(),
	})

	if len(h.rooms[room]) == 0 {
		delete(h.rooms, room)
	}
}

func (h *Hub) handleBroadcast(msg *Message) {
	if msg.Room != "" {
		h.broadcastToRoom(msg.Room, msg)
	} else {
		h.broadcastToAll(msg)
	}
}

func (h *Hub) handleTyping(msg *Message) {
	if msg.Room == "" {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, ok := h.rooms[msg.Room]
	if !ok {
		return
	}
	data, _ := json.Marshal(msg)
	for client := range clients {
		if client.UserID != msg.UserID {
			select {
			case client.Send <- data:
			default:
				log.Printf("[HUB] Failed to send typing to %s (buffer full)", client.Username)
			}
		}
	}
}

func (h *Hub) handleReaction(msg *Message) {
	h.handleBroadcast(msg)
}

func (h *Hub) broadcastToRoom(room string, msg *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, ok := h.rooms[room]
	if !ok {
		return
	}
	data, _ := json.Marshal(msg)
	for client := range clients {
		select {
		case client.Send <- data:
		default:
			log.Printf("[HUB] Failed to send to %s in room %s (buffer full)", client.Username, room)
		}
	}
}

func (h *Hub) broadcastToAll(msg *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	data, _ := json.Marshal(msg)
	for client := range h.clients {
		select {
		case client.Send <- data:
		default:
			log.Printf("[HUB] Failed to broadcast to %s (buffer full)", client.Username)
		}
	}
}

func (h *Hub) sendOnlineUsers() {
	h.mu.RLock()
	users := make([]OnlineUser, 0, len(h.clients))
	for client := range h.clients {
		users = append(users, OnlineUser{
			UserID:   client.UserID,
			Username: client.Username,
			Room:     client.Room,
		})
	}
	h.mu.RUnlock()

	data, _ := json.Marshal(OnlineUsersMsg{Type: "online_users", Users: users})

	h.mu.RLock()
	for client := range h.clients {
		select {
		case client.Send <- data:
		default:
		}
	}
	h.mu.RUnlock()
}

func (h *Hub) GetOnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) GetRoomCount(room string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if clients, ok := h.rooms[room]; ok {
		return len(clients)
	}
	return 0
}
