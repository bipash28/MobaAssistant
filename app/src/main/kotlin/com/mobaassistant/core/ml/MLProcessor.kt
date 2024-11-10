package com.mobaassistant.core.ml

import android.content.Context
import android.graphics.Bitmap
import com.mobaassistant.core.models.*
import org.tensorflow.lite.Interpreter
import javax.inject.Inject

class MLProcessor @Inject constructor(
    private val context: Context
) {
    private var interpreter: Interpreter? = null
    private val modelCache = ModelCache()

    init {
        loadModels()
    }

    private fun loadModels() {
        interpreter = Interpreter(loadModelFile("mlbb_analyzer.tflite"))
    }

    suspend fun detectHero(bitmap: Bitmap): Hero? {
        return modelCache.getOrCompute("hero_detection") {
            val inputArray = preprocessImage(bitmap)
            val outputArray = Array(1) { FloatArray(NUM_HEROES) }
            
            interpreter?.run(inputArray, outputArray)
            
            val heroIndex = outputArray[0].indices.maxByOrNull { outputArray[0][it] }
            heroIndex?.let { HERO_MAPPING[it] }
        }
    }

    suspend fun analyzeMinimap(bitmap: Bitmap): MapState {
        return modelCache.getOrCompute("minimap_analysis") {
            val inputArray = preprocessImage(bitmap)
            val outputArray = Array(1) { FloatArray(MAP_FEATURES) }
            
            interpreter?.run(inputArray, outputArray)
            
            parseMapState(outputArray[0])
        }
    }

    suspend fun analyzeObjectives(regions: List<Bitmap>): ObjectiveState {
        return modelCache.getOrCompute("objective_analysis") {
            val objectives = regions.map { bitmap ->
                val inputArray = preprocessImage(bitmap)
                val outputArray = Array(1) { FloatArray(OBJECTIVE_FEATURES) }
                
                interpreter?.run(inputArray, outputArray)
                
                parseObjectiveState(outputArray[0])
            }
            
            ObjectiveState(objectives)
        }
    }

    suspend fun analyzeTeamFight(bitmap: Bitmap): TeamFightState {
        return modelCache.getOrCompute("teamfight_analysis") {
            val inputArray = preprocessImage(bitmap)
            val outputArray = Array(1) { FloatArray(TEAMFIGHT_FEATURES) }
            
            interpreter?.run(inputArray, outputArray)
            
            parseTeamFightState(outputArray[0])
        }
    }

    private fun preprocessImage(bitmap: Bitmap): Array<Array<Array<Float>>> {
        val inputArray = Array(INPUT_SIZE) {
            Array(INPUT_SIZE) {
                Array(3) { 0f }
            }
        }
        
        // Normalize and resize image
        val scaledBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true)
        for (x in 0 until INPUT_SIZE) {
            for (y in 0 until INPUT_SIZE) {
                val pixel = scaledBitmap.getPixel(x, y)
                inputArray[x][y][0] = ((pixel shr 16) and 0xFF) / 255f
                inputArray[x][y][1] = ((pixel shr 8) and 0xFF) / 255f
                inputArray[x][y][2] = (pixel and 0xFF) / 255f
            }
        }
        
        return inputArray
    }

    private fun loadModelFile(filename: String): org.tensorflow.lite.support.common.TensorOperator {
        return context.assets.openFd(filename).use { fileDescriptor ->
            fileDescriptor.createInputStream().use { inputStream ->
                val modelBuffer = ByteArray(fileDescriptor.length.toInt())
                inputStream.read(modelBuffer)
                java.nio.ByteBuffer.wrap(modelBuffer)
            }
        }
    }

    companion object {
        private const val INPUT_SIZE = 224
        private const val NUM_HEROES = 100
        private const val MAP_FEATURES = 50
        private const val OBJECTIVE_FEATURES = 10
        private const val TEAMFIGHT_FEATURES = 20
        
        private val HERO_MAPPING = mapOf(
            0 to Hero("Layla", "Marksman"),
            1 to Hero("Tigreal", "Tank")
            // Add more hero mappings
        )
    }
}