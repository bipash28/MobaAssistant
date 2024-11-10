package com.mobaassistant.repository

import com.mobaassistant.model.Hero
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HeroRepository : JpaRepository<Hero, Long> {
    fun findAllByNameIn(names: List<String>): List<Hero>
}