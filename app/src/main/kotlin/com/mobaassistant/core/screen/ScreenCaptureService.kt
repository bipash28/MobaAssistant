package com.mobaassistant.core.screen

import android.app.Service
import android.content.Intent
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.mobaassistant.core.analysis.GameStateAnalyzer
import com.mobaassistant.core.utils.BatteryOptimizer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

class ScreenCaptureService @Inject constructor(
    private val gameStateAnalyzer: GameStateAnalyzer,
    private val batteryOptimizer: BatteryOptimizer
) : Service() {

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private val serviceScope = CoroutineScope(Dispatchers.Default + Job())
    private val screenState = MutableStateFlow<ScreenState>(ScreenState.Idle)

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(
            NOTIFICATION_ID,
            createNotification()
        )
        initializeScreenCapture()
    }

    private fun initializeScreenCapture() {
        imageReader = ImageReader.newInstance(
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
            android.graphics.PixelFormat.RGBA_8888,
            2
        ).apply {
            setOnImageAvailableListener({ reader ->
                if (batteryOptimizer.shouldProcessFrame()) {
                    processFrame(reader)
                }
            }, null)
        }
    }

    private fun processFrame(reader: ImageReader) {
        serviceScope.launch(Dispatchers.IO) {
            reader.acquireLatestImage()?.use { image ->
                val bitmap = image.toBitmap()
                val gameState = gameStateAnalyzer.analyzeFrame(bitmap)
                screenState.emit(ScreenState.Processing(gameState))
            }
        }
    }

    private fun createNotification() = NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("MLBB Assistant")
        .setContentText("Analyzing game in background")
        .setSmallIcon(android.R.drawable.ic_menu_compass)
        .build()

    override fun onDestroy() {
        virtualDisplay?.release()
        mediaProjection?.stop()
        imageReader?.close()
        super.onDestroy()
    }

    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "mlbb_assistant_channel"
        private const val SCREEN_WIDTH = 1080
        private const val SCREEN_HEIGHT = 2400
    }
}

sealed class ScreenState {
    object Idle : ScreenState()
    data class Processing(val gameState: GameState) : ScreenState()
    data class Error(val message: String) : ScreenState()
}