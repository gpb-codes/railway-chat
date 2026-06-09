package internal

import "time"

type MessageType string

const (
	MsgTypeMessage  MessageType = "message"
	MsgTypeJoin     MessageType = "join"
	MsgTypeLeave    MessageType = "leave"
	MsgTypeTyping   MessageType = "typing"
	MsgTypeReaction MessageType = "reaction"
	MsgTypeDM       MessageType = "dm"
)

type Message struct {
	Type      MessageType `json:"type"`
	Content   string      `json:"content,omitempty"`
	Username  string      `json:"username"`
	UserID    string      `json:"userId"`
	Room      string      `json:"room,omitempty"`
	ToUser    string      `json:"toUser,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
	Reaction  string      `json:"reaction,omitempty"`
	MessageID string      `json:"messageId,omitempty"`
	ID        string      `json:"id,omitempty"`
	User      *UserObj    `json:"user,omitempty"`
}

type UserObj struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Avatar   string `json:"avatar,omitempty"`
}

type WSMessage struct {
	Type      MessageType `json:"type"`
	Content   string      `json:"content"`
	Room      string      `json:"room"`
	ToUser    string      `json:"toUser,omitempty"`
	Reaction  string      `json:"reaction,omitempty"`
	MessageID string      `json:"messageId,omitempty"`
	ID        string      `json:"id,omitempty"`
	User      *UserObj    `json:"user,omitempty"`
}

type OnlineUsersMsg struct {
	Type  string         `json:"type"`
	Users []OnlineUser   `json:"users"`
}

type OnlineUser struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	Room     string `json:"room"`
}
