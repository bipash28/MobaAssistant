package com.mobaassistant.websocket

import com.fasterxml.jackson.databind.ObjectMapper
import com.mobaassistant.model.GameState
import com.mobaassistant.service.GameAnalysisService
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

@Component
class GameStateWebSocket(
    private val gameAnalysisService: GameAnalysisService,
    private val objectMapper: ObjectMapper
) : TextWebSocketHandler() {
    private val sessions = mutableSetOf<WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        sessions.add(session)
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val gameState = objectMapper.readValue(message.payload, GameState::class.java)
        val analysis = gameAnalysisService.analyzeGameState(gameState)
        
        val response = objectMapper.writeValueAsString(analysis)
        session.sendMessage(TextMessage(response))
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        sessions.remove(session)
    }
}