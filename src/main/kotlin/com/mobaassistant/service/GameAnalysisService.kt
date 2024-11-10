package com.mobaassistant.service

import com.mobaassistant.model.GameState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.springframework.stereotype.Service
import kotlin.math.abs

@Service
class GameAnalysisService(
    private val heroService: HeroService,
    private val combatAnalysisService: CombatAnalysisService
) {
    fun analyzeGameState(gameState: GameState): GameAnalysis {
        val recommendations = mutableListOf<String>()
        val threats = mutableListOf<String>()
        val objectives = mutableListOf<String>()

        // Analyze gold difference
        val goldDiff = gameState.allyTeam.totalGold - gameState.enemyTeam.totalGold
        when {
            goldDiff < -2000 -> recommendations.add("Farm more and avoid unnecessary fights")
            goldDiff > 2000 -> recommendations.add("Press your advantage and secure objectives")
        }

        // Analyze enemy threats
        gameState.enemyTeam.players.forEach { player ->
            if (player.killCount > 3) {
                threats.add("Enemy ${player.heroId} is fed (${player.killCount} kills)")
            }
        }

        // Analyze objectives
        if (gameState.gameTime > 420 && gameState.currentObjective == "lord") {
            objectives.add("Lord is spawning soon, prepare vision")
        }

        return GameAnalysis(recommendations, threats, objectives)
    }

    fun getCounterBuildSuggestions(
        heroId: String,
        enemyTeam: List<String>
    ): BuildSuggestions {
        val itemSuggestions = mutableListOf<String>()
        val reasoning = mutableListOf<String>()

        // Analyze enemy team composition
        val hasPhysicalDamage = enemyTeam.any { enemyId ->
            val hero = heroService.getHeroById(enemyId.toLong())
            hero.role in listOf("Marksman", "Fighter")
        }

        val hasMagicDamage = enemyTeam.any { enemyId ->
            val hero = heroService.getHeroById(enemyId.toLong())
            hero.role == "Mage"
        }

        if (hasPhysicalDamage) {
            itemSuggestions.add("Antique Cuirass")
            reasoning.add("Enemy has physical damage dealers")
        }

        if (hasMagicDamage) {
            itemSuggestions.add("Athena's Shield")
            reasoning.add("Enemy has magic damage dealers")
        }

        return BuildSuggestions(itemSuggestions, reasoning)
    }

    fun observeGameState(): Flow<GameState> = flow {
        // In a real implementation, this would connect to the game's API
        // For now, we'll emit mock data
        while (true) {
            // Emit game state updates
            kotlinx.coroutines.delay(1000)
        }
    }
}

data class GameAnalysis(
    val recommendations: List<String>,
    val threats: List<String>,
    val objectives: List<String>
)

data class BuildSuggestions(
    val itemSuggestions: List<String>,
    val reasoning: List<String>
)