package com.mobaassistant

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MobaAssistantApplication

fun main(args: Array<String>) {
    runApplication<MobaAssistantApplication>(*args)
}