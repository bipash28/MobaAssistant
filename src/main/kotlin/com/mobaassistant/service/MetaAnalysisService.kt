package com.mobaassistant.service

import com.mobaassistant.model.Hero
import com.mobaassistant.repository.HeroRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

@Service
class MetaAnalysisService(
    private val heroRepository: HeroRepository
) {
    private val metaUpdateInterval = Duration.ofHours(24)
    private var lastUpdate: Instant = Instant.EPOCH
    private var cachedMetaAnalysis: MetaAnalysis? = null

    suspend fun analyzeCurrentMeta(): MetaAnalysis {
        if (shouldUpdateMeta()) {
            cachedMetaAnalysis = performMetaAnalysis()
            lastUpdate = Instant.now()
        }
        return cachedMetaAnalysis ?: performMetaAnalysis()
    }

    fun observeMetaChanges(): Flow<MetaAnalysis> = flow {
        while (true) {
            emit(analyzeCurrentMeta())
            kotlinx.coroutines.delay(metaUpdateInterval.toMillis())
        }
    }

    private fun shouldUpdateMeta(): Boolean {
        return Duration.between(lastUpdate, Instant.now()) > metaUpdateInterval
    }

    private suspend fun performMetaAnalysis(): MetaAnalysis {
        val heroes = heroRepository.findAll()
        return MetaAnalysis(
            topPicks = findTopPicks(heroes),
            banPriorities = findBanPriorities(heroes),
            counterPicks = findCounterPicks(heroes),
            metaStrategies = determineMetaStrategies()
        )
    }

    private fun findTopPicks(heroes: List<Hero>): List<String> {
        return heroes
            .filter { hero -> 
                val stats = getHeroStats(hero)
                stats.pickRate > 0.5 && stats.winRate > 0.5
            }
            .map { it.name }
    }

    private fun findBanPriorities(heroes: List<Hero>): List<String> {
        return heroes
            .filter { hero ->
                val stats = getHeroStats(hero)
                stats.banRate > 0.3
            }
            .map { it.name }
    }

    private fun findCounterPicks(heroes: List<Hero>): Map<String, List<String>> {
        return heroes.associate { hero ->
            hero.name to hero.counters
        }
    }

    private fun determineMetaStrategies(): List<String> {
        return listOf(
            "Early game aggression",
            "Objective-focused gameplay",
            "Split push pressure",
            "Team fight composition"
        )
    }

    private fun getHeroStats(hero: Hero): HeroMetaStats {
        // In a real implementation, this would fetch from a database or API
        return HeroMetaStats(
            pickRate = 0.6,
            winRate = 0.52,
            banRate = 0.3
        )
    }
}

data class MetaAnalysis(
    val topPicks: List<String>,
    val banPriorities: List<String>,
    val counterPicks: Map<String, List<String>>,
    val metaStrategies: List<String>
)

data class HeroMetaStats(
    val pickRate: Double,
    val winRate: Double,
    val banRate: Double
)