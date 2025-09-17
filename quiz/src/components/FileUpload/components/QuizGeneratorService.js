// QuizGeneratorService.js
class QuizGeneratorService {
  constructor() {
    this.isGenerating = false;
  }

  async generateQuiz(extractedText, aiOptions, callbacks = {}) {
    if (this.isGenerating) {
      throw new Error('Quiz generation already in progress');
    }

    const {
      onStart = () => {},
      onProgress = () => {},
      onComplete = () => {},
      onError = () => {},
    } = callbacks;

    this.isGenerating = true;

    try {
      // Start the generation process
      onStart();
      onProgress('analyzing', 'Preparing quiz generation...', 10);

      // Import the AI service
      const { LLMService } = await import('../../../utils/llmService');
      const llmService = new LLMService();

      // Update progress
      onProgress('analyzing', 'Analyzing content for quiz...', 30);

      // Generate questions using AI
      onProgress('generating', 'AI is generating quiz questions...', 60);
      
      const questions = await llmService.generateQuizQuestions(extractedText, aiOptions);
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions were generated from the content.');
      }

      // Update progress
      onProgress('finalizing', `Generated ${questions.length} questions. Finalizing...`, 90, {
        questionsGenerated: questions.length
      });

      // Complete
      onProgress('complete', 'Quiz generation complete!', 100, {
        questionsGenerated: questions.length
      });

      onComplete(questions);
      return questions;

    } catch (error) {
      console.error('Quiz generation failed:', error);
      onError(error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  async generateForDownload(extractedText, aiOptions, format, fileName, callbacks = {}) {
    const questions = await this.generateQuiz(extractedText, aiOptions, {
      ...callbacks,
      onProgress: (stage, message, progress, details) => {
        if (stage === 'complete') {
          callbacks.onProgress?.('finalizing', `Preparing ${format.toUpperCase()} download...`, 95, details);
        } else {
          callbacks.onProgress?.(stage, message, progress, details);
        }
      }
    });

    // Create quiz data for download
    const quizDataForDownload = {
      title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
      totalQuestions: questions.length,
      difficulty: aiOptions.difficulty || 'Medium',
      questions: questions,
      extractedText: extractedText
    };

    // Handle download based on format
    if (format === 'pdf') {
      callbacks.onProgress?.('finalizing', 'Generating PDF...', 98);
      const { default: CombinedPDFGenerator } = await import('../Engine/Results/ShareQuizModal/DownloadQuizButton/CombinedPDFGenerator');
      await CombinedPDFGenerator.generate(quizDataForDownload, questions);
    } else if (format === 'docx') {
      callbacks.onProgress?.('finalizing', 'Generating DOCX files...', 98);
      const { default: DOCXDownloadComponent } = await import('../Engine/Results/ShareQuizModal/DownloadQuizButton/DOCXDownloadComponent');
      await DOCXDownloadComponent.generate(quizDataForDownload, questions, (message) => {
        console.log(message);
      });
    }

    callbacks.onProgress?.('complete', 'Download ready!', 100, {
      questionsGenerated: questions.length
    });

    return { questions, quizData: quizDataForDownload };
  }

  isCurrentlyGenerating() {
    return this.isGenerating;
  }
}

// Export a singleton instance
const quizGeneratorService = new QuizGeneratorService();
export default quizGeneratorService;