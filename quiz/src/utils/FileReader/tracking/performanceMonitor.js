// performanceMonitor.js - Performance monitoring and optimization utilities
export class PerformanceMonitor {
	constructor(enabled = true) {
		this.enabled = enabled;
		this.metrics = new Map();
		this.startTimes = new Map();
	}

	start(operation) {
		if (!this.enabled) return;
		this.startTimes.set(operation, performance.now());
	}

	end(operation, metadata = {}) {
		if (!this.enabled) return;

		const startTime = this.startTimes.get(operation);
		if (!startTime) return;

		const duration = performance.now() - startTime;

		if (!this.metrics.has(operation)) {
			this.metrics.set(operation, []);
		}

		this.metrics.get(operation).push({
			duration,
			timestamp: Date.now(),
			metadata,
		});

		this.startTimes.delete(operation);
		return duration;
	}

	getMetrics(operation = null) {
		if (operation) {
			return this.metrics.get(operation) || [];
		}
		return Object.fromEntries(this.metrics);
	}

	getAverageTime(operation) {
		const operationMetrics = this.metrics.get(operation);
		if (!operationMetrics || operationMetrics.length === 0) return 0;

		const total = operationMetrics.reduce(
			(sum, metric) => sum + metric.duration,
			0
		);
		return total / operationMetrics.length;
	}

	clear() {
		this.metrics.clear();
		this.startTimes.clear();
	}

	report() {
		if (!this.enabled) return;

		console.group('Performance Report');
		for (const [operation, metrics] of this.metrics) {
			const avg = this.getAverageTime(operation);
			const total = metrics.reduce((sum, m) => sum + m.duration, 0);
			console.log(
				`${operation}: ${metrics.length} calls, avg: ${avg.toFixed(
					2
				)}ms, total: ${total.toFixed(2)}ms`
			);
		}
		console.groupEnd();
	}
}

// Memory usage monitoring
export class MemoryMonitor {
	constructor() {
		this.snapshots = [];
	}

	snapshot(label = 'snapshot') {
		if (!performance.memory) {
			console.warn('Memory monitoring not supported in this browser');
			return null;
		}

		const memory = {
			used: performance.memory.usedJSHeapSize,
			total: performance.memory.totalJSHeapSize,
			limit: performance.memory.jsHeapSizeLimit,
			timestamp: Date.now(),
			label,
		};

		this.snapshots.push(memory);
		return memory;
	}

	getMemoryDelta(startLabel, endLabel = null) {
		const start = this.snapshots.find((s) => s.label === startLabel);
		const end = endLabel
			? this.snapshots.find((s) => s.label === endLabel)
			: this.snapshots[this.snapshots.length - 1];

		if (!start || !end) return null;

		return {
			used: end.used - start.used,
			total: end.total - start.total,
			duration: end.timestamp - start.timestamp,
		};
	}

	clear() {
		this.snapshots = [];
	}
}

// Resource cleanup utilities
export class ResourceManager {
	constructor() {
		this.resources = new Set();
		this.cleanupHandlers = new Map();
	}

	register(resource, cleanupFn) {
		this.resources.add(resource);
		if (cleanupFn) {
			this.cleanupHandlers.set(resource, cleanupFn);
		}
	}

	unregister(resource) {
		this.resources.delete(resource);
		this.cleanupHandlers.delete(resource);
	}

	async cleanup(resource = null) {
		if (resource) {
			// Clean up specific resource
			const handler = this.cleanupHandlers.get(resource);
			if (handler) {
				try {
					await handler();
				} catch (error) {
					console.warn('Resource cleanup failed:', error);
				}
			}
			this.unregister(resource);
		} else {
			// Clean up all resources
			const promises = [];
			for (const [resource, handler] of this.cleanupHandlers) {
				promises.push(
					handler().catch((error) => {
						console.warn('Resource cleanup failed:', error);
					})
				);
			}
			await Promise.allSettled(promises);
			this.resources.clear();
			this.cleanupHandlers.clear();
		}
	}
}

// Batch processing utilities
export function createBatchProcessor(batchSize = 5, maxConcurrency = 3) {
	return async function processBatch(items, processor, onProgress = null) {
		const results = [];
		const semaphore = new Semaphore(maxConcurrency);

		for (let i = 0; i < items.length; i += batchSize) {
			const batch = items.slice(i, i + batchSize);
			const batchPromises = batch.map(async (item, index) => {
				await semaphore.acquire();
				try {
					const result = await processor(item, i + index);
					if (onProgress) {
						onProgress(i + index + 1, items.length, result);
					}
					return result;
				} finally {
					semaphore.release();
				}
			});

			const batchResults = await Promise.allSettled(batchPromises);
			results.push(
				...batchResults.map((r) => (r.status === 'fulfilled' ? r.value : null))
			);
		}

		return results;
	};
}

// Simple semaphore for controlling concurrency
class Semaphore {
	constructor(maxConcurrency) {
		this.maxConcurrency = maxConcurrency;
		this.currentCount = 0;
		this.waitQueue = [];
	}

	async acquire() {
		if (this.currentCount < this.maxConcurrency) {
			this.currentCount++;
			return;
		}

		return new Promise((resolve) => {
			this.waitQueue.push(resolve);
		});
	}

	release() {
		this.currentCount--;
		if (this.waitQueue.length > 0) {
			const next = this.waitQueue.shift();
			this.currentCount++;
			next();
		}
	}
}
