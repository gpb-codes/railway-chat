package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"ws-server/internal"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		allowed := os.Getenv("ALLOWED_ORIGINS")
		if allowed == "" || allowed == "*" {
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

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	hub := internal.NewHub()
	go hub.Run()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		jsonResponse(w, map[string]interface{}{
			"status":    "ok",
			"online":    hub.GetOnlineCount(),
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"uptime":    time.Since(startTime).String(),
		})
	})

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		username := r.URL.Query().Get("username")
		userID := r.URL.Query().Get("userId")
		if username == "" {
			username = "anon"
		}
		if userID == "" {
			userID = username
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[WS] Upgrade error: %v", err)
			return
		}

		client := internal.NewClient(hub, conn, username, userID)
		hub.Register <- client

		log.Printf("[WS] Client connected: %s (%s)", username, userID)

		go client.WritePump()
		go client.ReadPump()
	})

	mux.HandleFunc("/api/online", func(w http.ResponseWriter, r *http.Request) {
		jsonResponse(w, map[string]interface{}{
			"count": hub.GetOnlineCount(),
		})
	})

	mux.HandleFunc("/api/rooms", func(w http.ResponseWriter, r *http.Request) {
		room := r.URL.Query().Get("room")
		if room == "" {
			jsonResponse(w, map[string]interface{}{
				"error": "room parameter required",
			})
			return
		}
		jsonResponse(w, map[string]interface{}{
			"room":  room,
			"count": hub.GetRoomCount(room),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("[WS] Server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

var startTime = time.Now()
