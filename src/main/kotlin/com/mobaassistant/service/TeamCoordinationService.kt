package com.mobaassistant.service

import com.mobaassistant.model.GameState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.springframework.stereotype.Service

@Service
class TeamCoordinationService {
    private val quickCommands = mapOf(
        "gather" to "Group up for objective",
        "retreat" to "Fall back - enemy missing",
        "push" to "Push towers while ahead",
        "defend" to "Defend base - enemy pushing"
    )

    fun generateCallouts(gameState: GameState): List<CoordinationCommand> {
        val commands = mutableListOf<CoordinationCommand>()

        if (isTeamfightImminent(gameState)) {
            commands.add(CoordinationCommand(
                type = CommandType.TEAMFIGHT,
                message = "Prepare for team fight",
                priority = Priority.HIGH
            ))
        }

        gameState.currentObjective?.let { objective ->
            commands.add(CoordinationCommand(
                type = CommandType.OBJECTIVE,
                message = "Setup for $objective",
                priority = Priority.MEDIUM
            ))
        }

        return commands
    }

    fun getQuickCommand(situation: String): String {
        return quickCommands[situation.lowercase()] ?: "Invalid command"
    }

    fun getRoleSpecificCallouts(role: String): List<String> {
        return when (role.lowercase()) {
            "tank" -> listOf(
                "Initiate when team is ready",
                "Protect carries in teamfight"
            )
            "marksman" -> listOf(
                "Focus highest priority target",
                "Stay behind frontline"
            )
            "assassin" -> listOf(
                "Look for pick-off opportunities",
                "Split push side lanes"
            )
            else -> emptyList()
        }
    }

    fun observeTeamCoordination(gameState: GameState): Flow<List<CoordinationCommand>> = flow {
        while (true) {
            emit(generateCallouts(gameState))
            kotlinx.coroutines.delay(1000)
        }
    }

    private fun isTeamfightImminent(gameState: GameState): Boolean {
        // Implement teamfight prediction logic
        return gameState.currentObjective != null
    }
}

enum class CommandType {
    TEAMFIGHT, OBJECTIVE, ROTATION, GENERAL
}

enum class Priority {
    LOW, MEDIUM, HIGH
}

data class CoordinationCommand(
    val type: CommandType,
    val message: String,
    val priority: Priority,
    val timestamp: Long = System.currentTimeMillis()
)