package com.mobaassistant.di

import android.content.Context
import com.mobaassistant.core.analysis.GameStateAnalyzer
import com.mobaassistant.core.ml.MLProcessor
import com.mobaassistant.core.utils.BatteryOptimizer
import com.mobaassistant.core.utils.ImageProcessor
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideMLProcessor(
        @ApplicationContext context: Context
    ): MLProcessor = MLProcessor(context)

    @Provides
    @Singleton
    fun provideImageProcessor(): ImageProcessor = ImageProcessor()

    @Provides
    @Singleton
    fun provideBatteryOptimizer(
        @ApplicationContext context: Context
    ): BatteryOptimizer = BatteryOptimizer(context)

    @Provides
    @Singleton
    fun provideGameStateAnalyzer(
        mlProcessor: MLProcessor,
        imageProcessor: ImageProcessor
    ): GameStateAnalyzer = GameStateAnalyzer(mlProcessor, imageProcessor)
}