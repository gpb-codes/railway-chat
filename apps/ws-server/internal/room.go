package internal

type RoomRequest struct {
	client *Client
	room   string
}

type Room struct {
	Name    string
	clients map[*Client]bool
}

func NewRoom(name string) *Room {
	return &Room{
		Name:    name,
		clients: make(map[*Client]bool),
	}
}
