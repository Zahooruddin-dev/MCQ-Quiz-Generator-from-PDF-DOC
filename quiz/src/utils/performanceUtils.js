// performanceUtils.js - Advanced performance optimization utilities

/**
 * Advanced debounce with immediate execution option and cancel capability
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout, result;
  const debounced = function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) result = func.apply(context, args);
    return result;
  };
  
  // Add cancel method
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };
  
  return debounced;
};

/**
 * Advanced memoization with TTL, size limits, and cache statistics
 */
export const memoize = (fn, options = {}) => {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000, // 5 minutes default
    keyGenerator = (...args) => JSON.stringify(args),
    onCacheHit = () => {},
    onCacheMiss = () => {}
  } = options;

  const cache = new Map();
  const timeouts = new Map();
  let stats = { hits: 0, misses: 0, evictions: 0 };

  const memoized = function(...args) {
    const key = keyGenerator(...args);
    
    // Check if cached result exists and is valid
    if (cache.has(key)) {
      stats.hits++;
      onCacheHit(key, stats);
      return cache.get(key);
    }

    // Cache miss - compute result
    stats.misses++;
    onCacheMiss(key, stats);
    
    const result = fn.apply(this, args);
    
    // Manage cache size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      if (timeouts.has(firstKey)) {
        clearTimeout(timeouts.get(firstKey));
        timeouts.delete(firstKey);
      }
      stats.evictions++;
    }
    
    // Set cache with TTL
    cache.set(key, result);
    
    if (ttl > 0) {
      const timeout = setTimeout(() => {
        cache.delete(key);
        timeouts.delete(key);
      }, ttl);
      timeouts.set(key, timeout);
    }
    
    return result;
  };

  // Add utility methods
  memoized.clear = () => {
    cache.clear();
    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts.clear();
    stats = { hits: 0, misses: 0, evictions: 0 };
  };
  
  memoized.delete = (key) => {
    const deleted = cache.delete(key);
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key));
      timeouts.delete(key);
    }
    return deleted;
  };
  
  memoized.has = (key) => cache.has(key);
  memoized.stats = () => ({ ...stats, size: cache.size });
  
  return memoized;
};

/**
 * Advanced performance measurement with statistical analysis
 */
export const measurePerformance = (name, options = {}) => {
  const { 
    logToConsole = true, 
    collectStats = true,
    warningThreshold = 1000 // ms
  } = options;
  
  const start = performance.now();
  let measurements = measurePerformance.measurements || (measurePerformance.measurements = new Map());
  
  return (additionalData = {}) => {
    const end = performance.now();
    const duration = end - start;
    
    if (collectStats) {
      if (!measurements.has(name)) {
        measurements.set(name, []);
      }
      measurements.get(name).push({ duration, timestamp: Date.now(), ...additionalData });
      
      // Keep only last 100 measurements per operation
      const history = measurements.get(name);
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
    }
    
    if (logToConsole) {
      const message = `${name} took ${duration.toFixed(2)}ms`;
      if (duration > warningThreshold) {
        console.warn(`⚠️ SLOW: ${message}`, additionalData);
      } else {
        console.debug(`⚡ ${message}`, additionalData);
      }
    }
    
    return { name, duration, additionalData };
  };
};

/**
 * Get performance statistics for all measured operations
 */
measurePerformance.getStats = (operationName) => {
  const measurements = measurePerformance.measurements || new Map();
  
  if (operationName) {
    const data = measurements.get(operationName) || [];
    if (data.length === 0) return null;
    
    const durations = data.map(m => m.duration);
    return {
      name: operationName,
      count: data.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: data.slice(-10).map(m => m.duration)
    };
  }
  
  // Return stats for all operations
  const allStats = {};
  for (const [name, data] of measurements) {
    const durations = data.map(m => m.duration);
    allStats[name] = {
      count: data.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }
  return allStats;
};

/**
 * Throttle function with leading and trailing execution options
 */
export const throttle = (func, limit, options = {}) => {
  const { leading = true, trailing = true } = options;
  let inThrottle, lastFunc, lastRan;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      if (leading) func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      if (trailing) {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
    
    setTimeout(() => inThrottle = false, limit);
  };
};

/**
 * Batch processing utility for handling large datasets
 */
export const batchProcess = async (items, processor, batchSize = 10, delay = 0) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(async (item, index) => {
      try {
        const result = await processor(item, i + index);
        return { success: true, result, index: i + index };
      } catch (error) {
        return { success: false, error, index: i + index };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach(({ value }) => {
      if (value.success) {
        results.push({ index: value.index, result: value.result });
      } else {
        errors.push({ index: value.index, error: value.error });
      }
    });
    
    // Add delay between batches if specified
    if (delay > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { results, errors, total: items.length, processed: results.length };
};