// progress.js - Progress tracking with performance monitoring
import { PROCESSING_STAGES } from './types.js';

export class ProcessingProgress {
  constructor(onProgress, options = {}) {
    this.onProgress = onProgress || (() => {});
    this.startTime = Date.now();
    this.stageStartTime = Date.now();
    this.currentStage = null;
    this.stageHistory = [];
    this.options = {
      enablePerformanceTracking: true,
      logProgress: false,
      ...options
    };
  }

  update(stage, progress, message, metadata = {}) {
    const now = Date.now();
    const totalElapsed = now - this.startTime;
    const stageElapsed = this.currentStage === stage ? now - this.stageStartTime : 0;

    // Track stage changes
    if (this.currentStage !== stage) {
      if (this.currentStage) {
        this.stageHistory.push({
          stage: this.currentStage,
          duration: now - this.stageStartTime,
        });
      }
      this.currentStage = stage;
      this.stageStartTime = now;
    }

    const progressData = {
      stage,
      progress: Math.min(100, Math.max(0, progress)),
      message,
      metadata,
      timing: {
        totalElapsed,
        stageElapsed,
        estimatedRemaining: this.estimateRemainingTime(progress, totalElapsed),
      }
    };

    if (this.options.logProgress) {
      console.log(`[${stage}] ${progress}%: ${message} (${totalElapsed}ms)`);
    }

    this.onProgress(progressData);
  }

  estimateRemainingTime(progress, elapsed) {
    if (progress <= 0) return null;
    if (progress >= 100) return 0;
    
    const rate = progress / elapsed;
    const remaining = (100 - progress) / rate;
    return Math.round(remaining);
  }

  complete(message = 'Processing completed') {
    const totalTime = Date.now() - this.startTime;
    
    if (this.options.enablePerformanceTracking) {
      console.log(`File processing completed in ${totalTime}ms`);
      console.log('Stage breakdown:', this.stageHistory);
    }

    this.update(PROCESSING_STAGES.COMPLETE, 100, message, {
      totalProcessingTime: totalTime,
      stageHistory: this.stageHistory,
    });
  }

  createSubProgress(stageWeight = 1, baseProgress = 0) {
    return {
      update: (subProgress, message, metadata) => {
        const adjustedProgress = baseProgress + (subProgress * stageWeight / 100);
        this.update(this.currentStage, adjustedProgress, message, metadata);
      }
    };
  }
}

// Utility for creating timeout-aware progress updates
export function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    })
  ]);
}