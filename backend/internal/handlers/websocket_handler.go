package handlers

import (
	"log"
	"net/http"

	"github.com/HarsukritP/havn/backend/internal/websocket"
	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

type WebSocketHandler struct {
	hub *websocket.Hub
}

func NewWebSocketHandler(hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: hub}
}

// HandleWebSocket handles WebSocket connections
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket: %v", err)
		return
	}

	// Get user ID from context (if authenticated)
	userID := ""
	if id, exists := c.Get("user_id"); exists {
		userID = id.(string)
	}

	// Create new client
	client := websocket.NewClient(h.hub, conn, userID)
	
	// Register client with hub
	h.hub.Register(client)

	// Start client read and write pumps
	client.Start()

	log.Println("New WebSocket connection established")
}

