package internal

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 65536
)

type Client struct {
	Hub        *Hub
	Conn       *websocket.Conn
	Send       chan []byte
	Room       string
	Username   string
	UserID     string
	ConnectedAt time.Time
	LastActive  time.Time
}

func NewClient(hub *Hub, conn *websocket.Conn, username, userID string) *Client {
	now := time.Now().UTC()
	return &Client{
		Hub:         hub,
		Conn:        conn,
		Send:        make(chan []byte, 256),
		Username:    username,
		UserID:      userID,
		ConnectedAt: now,
		LastActive:  now,
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		c.LastActive = time.Now().UTC()
		return nil
	})

	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseAbnormalClosure) {
				log.Printf("[WS] Read error for %s: %v", c.Username, err)
			}
			break
		}

		c.LastActive = time.Now().UTC()

		var wsMsg WSMessage
		if err := json.Unmarshal(data, &wsMsg); err != nil {
			log.Printf("[WS] Parse error from %s: %v", c.Username, err)
			continue
		}

		msg := Message{
			Type:      wsMsg.Type,
			Content:   wsMsg.Content,
			Username:  c.Username,
			UserID:    c.UserID,
			Room:      wsMsg.Room,
			ToUser:    wsMsg.ToUser,
			Reaction:  wsMsg.Reaction,
			MessageID: wsMsg.MessageID,
			ID:        wsMsg.ID,
			User:      wsMsg.User,
			Timestamp: time.Now().UTC(),
		}

		if msg.Room == "" {
			msg.Room = c.Room
		}

		switch msg.Type {
		case MsgTypeMessage, MsgTypeDM:
			c.Hub.broadcast <- &msg
		case MsgTypeJoin:
			c.Hub.joinRoom <- &RoomRequest{client: c, room: msg.Room}
		case MsgTypeLeave:
			c.Hub.leaveRoom <- &RoomRequest{client: c, room: msg.Room}
		case MsgTypeTyping:
			c.Hub.typing <- &msg
		case MsgTypeReaction:
			c.Hub.reaction <- &msg
		default:
			log.Printf("[WS] Unknown message type from %s: %s", c.Username, msg.Type)
		}
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
