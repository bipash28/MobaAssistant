package com.mobaassistant.model

import jakarta.persistence.*

@Entity
data class Hero(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    val name: String,
    val role: String,
    
    @Embedded
    val stats: HeroStats,
    
    @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    val skills: List<Skill>,
    
    @ElementCollection
    val counters: List<String>,
    
    @OneToMany(cascade = [CascadeType.ALL])
    val recommendedBuilds: List<Build>
)

@Embeddable
data class HeroStats(
    val damage: Int,
    val durability: Int,
    val difficulty: Int,
    val physicalDamage: Int = 0,
    val magicalDamage: Int = 0,
    val mobility: Int = 0,
    val crowdControl: Int = 0
)

@Entity
data class Skill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val name: String,
    val description: String,
    val cooldown: Double
)

@Entity
data class Build(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val name: String,
    
    @ElementCollection
    val items: List<String>,
    
    val description: String,
    
    @ElementCollection
    val goodAgainst: List<String>,
    
    @ElementCollection
    val badAgainst: List<String>,
    
    val playstyle: String
)