package websocket

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
)

// Hub maintains active WebSocket connections and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	redis      *redis.Client
}

// NewHub creates a new WebSocket hub
func NewHub(redis *redis.Client) *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		redis:      redis,
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	// Subscribe to Redis pub/sub for spot updates
	ctx := context.Background()
	pubsub := h.redis.Subscribe(ctx, "spot_updates")
	defer pubsub.Close()

	go func() {
		for {
			msg, err := pubsub.ReceiveMessage(ctx)
			if err != nil {
				log.Printf("Error receiving Redis message: %v", err)
				continue
			}

			// Broadcast message to all connected clients
			h.broadcast <- []byte(msg.Payload)
		}
	}()

	// Main hub loop
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client registered. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered. Total clients: %d", len(h.clients))
			}

		case message := <-h.broadcast:
			// Broadcast to all connected clients
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// BroadcastSpotUpdate publishes a spot update to Redis (which will broadcast to all connected clients)
func (h *Hub) BroadcastSpotUpdate(spotID string, data interface{}) error {
	ctx := context.Background()
	
	message := map[string]interface{}{
		"type": "spot_update",
		"data": data,
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return h.redis.Publish(ctx, "spot_updates", jsonData).Err()
}

