// quizValidator.js - Enhanced with comprehensive validation and performance optimization
import { measurePerformance, memoize } from './performanceUtils.js';

// Custom validation error class
export class QuizValidationError extends Error {
  constructor(message, questionIndex = null, field = null) {
    super(message);
    this.name = 'QuizValidationError';
    this.questionIndex = questionIndex;
    this.field = field;
    this.userMessage = this.getUserFriendlyMessage();
  }

  getUserFriendlyMessage() {
    if (this.questionIndex !== null) {
      return `Problem with question ${this.questionIndex + 1}: ${this.message}`;
    }
    return this.message;
  }
}

// Optimized Fisher-Yates shuffle with performance tracking
export function shuffleArray(array) {
  const endMeasure = measurePerformance('Array Shuffle', { logToConsole: false });
  
  if (!Array.isArray(array)) {
    throw new QuizValidationError('Input must be an array');
  }
  
  if (array.length <= 1) {
    endMeasure({ arrayLength: array.length });
    return [...array];
  }

  const newArray = [...array];
  
  // Modern Fisher-Yates shuffle
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  endMeasure({ arrayLength: array.length });
  return newArray;
}

// Memoized option validation for better performance
const validateOption = memoize((option, index) => {
  if (typeof option !== 'string') {
    return { valid: false, error: `Option ${index + 1} must be a string` };
  }
  
  const trimmed = option.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: `Option ${index + 1} cannot be empty` };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: `Option ${index + 1} is too short (minimum 2 characters)` };
  }
  
  if (trimmed.length > 200) {
    return { valid: false, error: `Option ${index + 1} is too long (maximum 200 characters)` };
  }
  
  return { valid: true, value: trimmed };
}, { maxSize: 1000, ttl: 60000 });

// Enhanced question validation with detailed error reporting
function validateSingleQuestion(question, index) {
  const errors = [];
  const warnings = [];
  
  try {
    // Validate question text
    if (!question.question || typeof question.question !== 'string') {
      errors.push('Question text is required and must be a string');
    } else {
      const questionText = question.question.trim();
      if (questionText.length < 10) {
        errors.push('Question text is too short (minimum 10 characters)');
      } else if (questionText.length > 500) {
        errors.push('Question text is too long (maximum 500 characters)');
      } else if (!questionText.endsWith('?')) {
        warnings.push('Question should end with a question mark');
      }
    }

    // Validate options array
    if (!Array.isArray(question.options)) {
      errors.push('Options must be an array');
    } else if (question.options.length !== 4) {
      errors.push(`Must have exactly 4 options, found ${question.options.length}`);
    } else {
      // Validate each option
      const validatedOptions = [];
      const optionTexts = new Set();
      
      for (let i = 0; i < question.options.length; i++) {
        const validation = validateOption(question.options[i], i);
        if (!validation.valid) {
          errors.push(validation.error);
        } else {
          const lowerValue = validation.value.toLowerCase();
          if (optionTexts.has(lowerValue)) {
            errors.push(`Options ${Array.from(optionTexts.keys()).indexOf(lowerValue) + 1} and ${i + 1} are duplicates`);
          } else {
            optionTexts.add(lowerValue);
            validatedOptions.push(validation.value);
          }
        }
      }

      // Check option length balance
      if (validatedOptions.length === 4) {
        const lengths = validatedOptions.map(opt => opt.length);
        const maxLength = Math.max(...lengths);
        const minLength = Math.min(...lengths);
        
        if (maxLength > minLength * 3) {
          warnings.push('Options have very different lengths, which may make the correct answer obvious');
        }
      }
    }

    // Validate correct answer
    if (typeof question.correctAnswer !== 'number') {
      errors.push('Correct answer must be a number');
    } else if (!Number.isInteger(question.correctAnswer)) {
      errors.push('Correct answer must be an integer');
    } else if (question.correctAnswer < 0 || question.correctAnswer > 3) {
      errors.push('Correct answer must be between 0 and 3');
    } else if (question.options && question.options[question.correctAnswer] == null) {
      errors.push('Correct answer index does not correspond to a valid option');
    }

    // Validate explanation (optional but recommended)
    if (question.explanation) {
      if (typeof question.explanation !== 'string') {
        errors.push('Explanation must be a string');
      } else {
        const explanation = question.explanation.trim();
        if (explanation.length > 0 && explanation.length < 10) {
          warnings.push('Explanation is very short and may not be helpful');
        } else if (explanation.length > 1000) {
          errors.push('Explanation is too long (maximum 1000 characters)');
        }
      }
    } else {
      warnings.push('No explanation provided for this question');
    }

    // Validate context (optional)
    if (question.context && typeof question.context !== 'string') {
      errors.push('Context must be a string');
    }

    // Validate language (optional)
    if (question.language && typeof question.language !== 'string') {
      errors.push('Language must be a string');
    }

    return { errors, warnings, valid: errors.length === 0 };
    
  } catch (error) {
    console.error(`Unexpected error validating question ${index + 1}:`, error);
    return { 
      errors: ['Unexpected validation error occurred'], 
      warnings: [], 
      valid: false 
    };
  }
}

// Enhanced question validation with batch processing and detailed reporting
export function validateQuestions(questions, options = {}) {
  const {
    strictMode = false,
    allowWarnings = true,
    maxQuestions = 50,
    onProgress = null
  } = options;

  const endMeasure = measurePerformance('Quiz Validation');
  
  try {
    // Basic input validation
    if (!Array.isArray(questions)) {
      throw new QuizValidationError('Questions must be provided as an array');
    }

    if (questions.length === 0) {
      throw new QuizValidationError('At least one question is required');
    }

    if (questions.length > maxQuestions) {
      throw new QuizValidationError(`Too many questions. Maximum allowed: ${maxQuestions}, provided: ${questions.length}`);
    }

    const validatedQuestions = [];
    const allErrors = [];
    const allWarnings = [];
    let validCount = 0;

    // Process questions in batches for better performance
    const batchSize = 10;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      batch.forEach((question, batchIndex) => {
        const actualIndex = i + batchIndex;
        
        onProgress?.({
          stage: 'validating',
          progress: (actualIndex / questions.length) * 100,
          currentQuestion: actualIndex + 1,
          total: questions.length
        });

        const validation = validateSingleQuestion(question, actualIndex);
        
        if (validation.valid) {
          validatedQuestions.push({
            ...question,
            question: question.question.trim(),
            options: question.options.map(opt => opt.toString().trim()),
            explanation: question.explanation?.trim() || '',
            context: question.context?.trim() || '',
            _validated: true,
            _originalIndex: actualIndex
          });
          validCount++;
        } else {
          // Collect errors with question context
          validation.errors.forEach(error => {
            allErrors.push(new QuizValidationError(error, actualIndex));
          });
        }

        // Collect warnings
        if (allowWarnings && validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            allWarnings.push({
              questionIndex: actualIndex,
              message: warning
            });
          });
        }
      });
    }

    onProgress?.({ stage: 'complete', progress: 100 });

    // Final validation results
    const results = {
      valid: allErrors.length === 0,
      validatedQuestions,
      validCount,
      totalCount: questions.length,
      errors: allErrors,
      warnings: allWarnings,
      summary: {
        passed: validCount,
        failed: questions.length - validCount,
        errorCount: allErrors.length,
        warningCount: allWarnings.length
      }
    };

    endMeasure({ 
      totalQuestions: questions.length,
      validQuestions: validCount,
      errors: allErrors.length,
      warnings: allWarnings.length,
      success: results.valid
    });

    // In strict mode, throw on any errors
    if (strictMode && allErrors.length > 0) {
      const errorMessage = allErrors.slice(0, 3).map(e => e.userMessage).join('; ');
      const additionalErrors = allErrors.length > 3 ? ` (and ${allErrors.length - 3} more)` : '';
      throw new QuizValidationError(`Validation failed: ${errorMessage}${additionalErrors}`);
    }

    // If no questions are valid, throw error
    if (validCount === 0) {
      throw new QuizValidationError('No valid questions found. Please check your question format.');
    }

    return results;

  } catch (error) {
    endMeasure({ success: false, error: error.message });
    
    if (error instanceof QuizValidationError) {
      throw error;
    }
    
    console.error('Unexpected validation error:', error);
    throw new QuizValidationError(`Validation failed: ${error.message}`);
  }
}

// Utility function to get validation summary
export function getValidationSummary(validationResult) {
  if (!validationResult) {
    return 'No validation result provided';
  }

  const { summary, errors, warnings } = validationResult;
  
  let message = `Validation complete: ${summary.passed}/${summary.passed + summary.failed} questions passed`;
  
  if (summary.errorCount > 0) {
    message += `\n❌ ${summary.errorCount} error(s) found`;
    if (errors.length > 0) {
      message += `:\n${errors.slice(0, 3).map(e => `  • ${e.userMessage}`).join('\n')}`;
      if (errors.length > 3) {
        message += `\n  • ... and ${errors.length - 3} more errors`;
      }
    }
  }
  
  if (summary.warningCount > 0) {
    message += `\n⚠️ ${summary.warningCount} warning(s) found`;
  }
  
  return message;
}

// Utility function to fix common question issues automatically
export function autoFixQuestions(questions, options = {}) {
  const { 
    fixQuestionMarks = true,
    trimWhitespace = true,
    removeEmptyOptions = true,
    logFixes = true 
  } = options;

  const endMeasure = measurePerformance('Auto Fix Questions');
  let fixCount = 0;

  try {
    const fixedQuestions = questions.map((question, index) => {
      const fixes = [];
      const fixed = { ...question };

      // Fix question text
      if (fixed.question && typeof fixed.question === 'string') {
        if (trimWhitespace) {
          const original = fixed.question;
          fixed.question = fixed.question.trim().replace(/\s+/g, ' ');
          if (original !== fixed.question) {
            fixes.push('trimmed whitespace in question');
          }
        }
        
        if (fixQuestionMarks && !fixed.question.endsWith('?')) {
          fixed.question += '?';
          fixes.push('added question mark');
        }
      }

      // Fix options
      if (Array.isArray(fixed.options)) {
        fixed.options = fixed.options.map((option, optIndex) => {
          if (typeof option === 'string' && trimWhitespace) {
            return option.trim().replace(/\s+/g, ' ');
          }
          return option;
        });

        if (removeEmptyOptions) {
          const originalLength = fixed.options.length;
          fixed.options = fixed.options.filter(opt => 
            opt != null && opt.toString().trim().length > 0
          );
          if (fixed.options.length !== originalLength) {
            fixes.push(`removed ${originalLength - fixed.options.length} empty options`);
          }
        }
      }

      // Fix explanation and context
      if (fixed.explanation && typeof fixed.explanation === 'string' && trimWhitespace) {
        fixed.explanation = fixed.explanation.trim();
      }

      if (fixed.context && typeof fixed.context === 'string' && trimWhitespace) {
        fixed.context = fixed.context.trim();
      }

      if (fixes.length > 0) {
        fixCount++;
        if (logFixes) {
          console.log(`🔧 Fixed question ${index + 1}: ${fixes.join(', ')}`);
        }
        fixed._autoFixed = fixes;
      }

      return fixed;
    });

    endMeasure({ questionsProcessed: questions.length, fixesApplied: fixCount });
    
    return {
      questions: fixedQuestions,
      fixCount,
      success: true
    };

  } catch (error) {
    endMeasure({ success: false, error: error.message });
    console.error('Error during auto-fix:', error);
    
    return {
      questions: questions, // Return original on error
      fixCount: 0,
      success: false,
      error: error.message
    };
  }
}