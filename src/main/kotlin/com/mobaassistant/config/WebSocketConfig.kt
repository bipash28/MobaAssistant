package com.mobaassistant.config

import com.mobaassistant.websocket.GameStateWebSocket
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class WebSocketConfig(
    private val gameStateWebSocket: GameStateWebSocket
) : WebSocketConfigurer {
    
    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(gameStateWebSocket, "/ws/gamestate")
            .setAllowedOrigins("*")
    }
}