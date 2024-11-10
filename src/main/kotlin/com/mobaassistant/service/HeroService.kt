package com.mobaassistant.service

import com.mobaassistant.model.Hero
import com.mobaassistant.repository.HeroRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HeroService(private val heroRepository: HeroRepository) {
    
    @Transactional(readOnly = true)
    fun getAllHeroes(): List<Hero> = heroRepository.findAll()
    
    @Transactional(readOnly = true)
    fun getHeroById(id: Long): Hero = heroRepository.findById(id)
        .orElseThrow { NoSuchElementException("Hero not found with id: $id") }
    
    @Transactional
    fun createHero(hero: Hero): Hero = heroRepository.save(hero)
    
    @Transactional
    fun updateHero(id: Long, hero: Hero): Hero {
        getHeroById(id) // Verify existence
        return heroRepository.save(hero.copy(id = id))
    }
    
    @Transactional
    fun deleteHero(id: Long) {
        heroRepository.deleteById(id)
    }
    
    fun getCounters(heroId: Long): List<Hero> {
        val hero = getHeroById(heroId)
        return heroRepository.findAllByNameIn(hero.counters)
    }
}