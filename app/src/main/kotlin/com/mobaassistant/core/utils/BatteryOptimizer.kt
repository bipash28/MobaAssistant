package com.mobaassistant.core.utils

import android.content.Context
import android.os.BatteryManager
import javax.inject.Inject

class BatteryOptimizer @Inject constructor(
    private val context: Context
) {
    private var lastProcessTime = 0L
    private val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager

    fun shouldProcessFrame(): Boolean {
        val currentTime = System.currentTimeMillis()
        val timeDiff = currentTime - lastProcessTime
        
        // Check battery level and charging state
        val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val isCharging = batteryManager.isCharging()
        
        // Determine processing frequency based on battery state
        val processingInterval = when {
            isCharging -> CHARGING_INTERVAL
            batteryLevel > 50 -> NORMAL_INTERVAL
            batteryLevel > 20 -> POWER_SAVING_INTERVAL
            else -> LOW_BATTERY_INTERVAL
        }
        
        return if (timeDiff >= processingInterval) {
            lastProcessTime = currentTime
            true
        } else {
            false
        }
    }

    companion object {
        private const val CHARGING_INTERVAL = 100L // 10 FPS
        private const val NORMAL_INTERVAL = 200L // 5 FPS
        private const val POWER_SAVING_INTERVAL = 500L // 2 FPS
        private const val LOW_BATTERY_INTERVAL = 1000L // 1 FPS
    }
}