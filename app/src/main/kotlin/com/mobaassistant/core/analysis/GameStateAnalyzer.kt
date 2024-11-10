package com.mobaassistant.core.analysis

import android.graphics.Bitmap
import com.mobaassistant.core.ml.MLProcessor
import com.mobaassistant.core.models.GameState
import com.mobaassistant.core.models.HeroState
import com.mobaassistant.core.utils.ImageProcessor
import javax.inject.Inject

class GameStateAnalyzer @Inject constructor(
    private val mlProcessor: MLProcessor,
    private val imageProcessor: ImageProcessor
) {

    suspend fun analyzeFrame(bitmap: Bitmap): GameState {
        val processedImage = imageProcessor.preprocess(bitmap)
        
        return GameState(
            heroes = detectHeroes(processedImage),
            mapState = detectMapState(processedImage),
            objectives = detectObjectives(processedImage),
            teamFight = detectTeamFight(processedImage),
            timestamp = System.currentTimeMillis()
        )
    }

    private suspend fun detectHeroes(bitmap: Bitmap): List<HeroState> {
        val heroRegions = imageProcessor.extractHeroRegions(bitmap)
        return heroRegions.mapNotNull { region ->
            mlProcessor.detectHero(region)?.let { hero ->
                HeroState(
                    hero = hero,
                    health = detectHealthBar(region),
                    mana = detectManaBar(region),
                    position = detectPosition(region),
                    skills = detectSkillStates(region)
                )
            }
        }
    }

    private suspend fun detectMapState(bitmap: Bitmap): MapState {
        val minimap = imageProcessor.extractMinimap(bitmap)
        return mlProcessor.analyzeMinimap(minimap)
    }

    private suspend fun detectObjectives(bitmap: Bitmap): ObjectiveState {
        val objectiveRegions = imageProcessor.extractObjectiveRegions(bitmap)
        return mlProcessor.analyzeObjectives(objectiveRegions)
    }

    private suspend fun detectTeamFight(bitmap: Bitmap): TeamFightState {
        return mlProcessor.analyzeTeamFight(bitmap)
    }

    private fun detectHealthBar(region: Bitmap): Float {
        return imageProcessor.analyzeHealthBar(region)
    }

    private fun detectManaBar(region: Bitmap): Float {
        return imageProcessor.analyzeManaBar(region)
    }

    private fun detectPosition(region: Bitmap): Position {
        return imageProcessor.detectPosition(region)
    }

    private suspend fun detectSkillStates(region: Bitmap): List<SkillState> {
        val skillRegions = imageProcessor.extractSkillRegions(region)
        return skillRegions.map { skillRegion ->
            SkillState(
                cooldown = imageProcessor.detectCooldown(skillRegion),
                available = imageProcessor.isSkillAvailable(skillRegion)
            )
        }
    }
}