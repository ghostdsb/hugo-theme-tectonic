---
title: "Building a Real-Time Multiplayer WebSocket Server in Go"
date: 2026-05-24T10:00:00+05:30
description: "Creating a concurrent, low-latency state-synchronization hub for multi-client retro browser games."
categories: ["realtime"]
tags: ["go", "websockets", "concurrency", "networking"]
---

Real-time browser-based retro games require synchronous, sub-100ms updates between all active clients. HTTP polling is far too heavy and introduces unacceptable jitter.

This post details how to engineer a high-throughput, concurrent WebSocket hub in Go, integrating a channel-based dispatch loop and robust authentication.

---

### The Hub Architecture

Our Go architecture uses a single central `Hub` that coordinates connection registration, active client maps, and message broadcasting. By utilizing Go's native channels, we bypass the need for explicit mutex locking on our maps, avoiding potential lock contention under high load.

Here is the central Hub struct:

```go
type Hub struct {
    // Registered clients.
    clients map[*Client]bool

    // Inbound messages from the clients.
    broadcast chan []byte

    // Register requests from the clients.
    register chan *Client

    // Unregister requests from clients.
    unregister chan *Client
}

func NewHub() *Hub {
    return &Hub{
        broadcast:  make(chan []byte),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        clients:    make(map[*Client]bool),
    }
}
```

---

### The Dispatch Loop

The Hub runs an infinite select loop in a background goroutine, listening for client registrations, disconnections, or broadcast actions:

```go
func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true
            log.Printf("Client connected: %s", client.conn.RemoteAddr())
            
        case client := <-h.unregister:
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
                log.Printf("Client disconnected: %s", client.conn.RemoteAddr())
            }
            
        case message := <-h.broadcast:
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
```

---

### Secure Handshakes with Redis Token Caching

To prevent unauthorized automated agents from flooding the multiplayer rooms, we require clients to present a valid CSRF handshake token. 

Our authentication middleware extracts this token and validates it against a fast Redis memory cache. The token verification function uses a 23-hour sliding expiration window matching our session key pattern:

```go
// VerifyCSRFToken checks if the token exists in Redis cache
func VerifyCSRFToken(ctx context.Context, rdb *redis.Client, gameCode, propertyCode, subID, token string) (bool, error) {
    key := fmt.Sprintf("csrf_token:%s:%s:%s", gameCode, propertyCode, subID)
    
    cachedToken, err := rdb.Get(ctx, key).Result()
    if err == redis.Nil {
        return false, nil // Token not found or expired
    } else if err != nil {
        return false, err // Redis error
    }
    
    return cachedToken == token, nil
}
```

This ensures that we only allocate expensive connection handles (goroutines and TCP socket buffers) to authenticated players, keeping memory consumption predictable and stable.

---

### Production Scale Considerations

1. **System File Descriptors**: Ensure `/etc/security/limits.conf` is configured to allow high `nofile` counts. Each concurrent socket connection consumes one file descriptor.
2. **Ping/Pong Heartbeats**: Modern browser clients automatically disconnect on quiet sockets. Implement a ping interval (e.g., every 50 seconds) from the server side to maintain active NAT pathways.
