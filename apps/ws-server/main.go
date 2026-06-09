package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"ws-server/internal"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		allowed := os.Getenv("ALLOWED_ORIGINS")
		if allowed == "" {
			return true
		}
		origin := r.Header.Get("Origin")
		for _, o := range strings.Split(allowed, ",") {
			if strings.TrimSpace(o) == origin {
				return true
			}
		}
		return false
	},
}

func main() {
	hub := internal.NewHub()
	go hub.Run()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"online": hub.GetOnlineCount(),
		})
	})

	r.GET("/ws", func(c *gin.Context) {
		username := c.Query("username")
		userID := c.Query("userId")
		if username == "" {
			username = "anon"
		}
		if userID == "" {
			userID = username
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("upgrade error: %v", err)
			return
		}

		client := &internal.Client{
			Hub:      hub,
			Conn:     conn,
			Send:     make(chan []byte, 256),
			Username: username,
			UserID:   userID,
		}
		hub.Register <- client

		go client.WritePump()
		go client.ReadPump()
	})

	r.GET("/api/online", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"count": hub.GetOnlineCount(),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("WS Server starting on :%s", port)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatal(err)
	}
}
