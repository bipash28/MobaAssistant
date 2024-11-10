package com.mobaassistant.model

data class GameState(
    val allyTeam: TeamState,
    val enemyTeam: TeamState,
    val gameTime: Int,
    val currentObjective: String?
)

data class TeamState(
    val players: List<PlayerState>,
    val totalGold: Int,
    val towers: Int,
    val objectives: List<String>
)

data class PlayerState(
    val heroId: String,
    val level: Int,
    val gold: Int,
    val items: List<String>,
    val killCount: Int,
    val deathCount: Int,
    val assistCount: Int
)