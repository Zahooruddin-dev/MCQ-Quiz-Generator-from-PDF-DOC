import { useState, useRef } from 'react';
import { LLMService } from '../../utils/llmService';
import ErrorMessage from './ErrorMessage';
import AIConfigPanel from './AIConfigPanel';
import Dropzone from './Dropzone';
import SampleTextButtons from './SampleTextButtons';
import HiddenFileInput from './HiddenFileInput';
import TextModeInput from './TextModeInput';
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from './utils';
import AppHeader from '../Layout/AppHeader';

const FileUpload = ({
  onFileUpload,
  hasAI,
  apiKey,
  baseUrl,
  loading: loadingFromParent = false,
  onReconfigure,
  onProfileClick,
}) => {
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({ numQuestions: 10, difficulty: 'medium' });
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showTextMode, setShowTextMode] = useState(true);
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const busyRef = useRef(false);
  const effectiveLoading = isLoading || loadingFromParent;

  const SAMPLE_TEXT = `Sample MCQ source text:
1) The capital of France is Paris.
2) Water boils at 100 degrees Celsius at sea level.`;

  const startLoading = () => { setError(null); setIsLoading(true); busyRef.current = true; };
  const stopLoading = () => { setIsLoading(false); busyRef.current = false; };
  const clearSelectedFile = () => { setFileName(''); setFileSize(null); setFileType(''); setError(null); };
  const handleReconfigure = (e) => { e?.preventDefault?.(); if (typeof onReconfigure === 'function') onReconfigure(); };

  const handleFileSelect = async (file) => {
    if (busyRef.current) return;
    setError(null);
    try {
      if (!file) return;
      setFileName(file.name || 'uploaded-file');
      setFileSize(file.size || null);
      setFileType(file.type || '');
      if (file.size && file.size > MAX_FILE_SIZE) {
        setError(`File is too big (${formatBytes(file.size)}). Max allowed is ${formatBytes(MAX_FILE_SIZE)}.`);
        clearSelectedFile(); return;
      }
      const mime = (file.type || '').toLowerCase();
      const isSupported = SUPPORTED.some(s => mime.includes(s)) || /\.(pdf|docx?|txt|html)$/i.test(file.name || '');
      if (!isSupported) { setError('Unsupported file type. Supported: PDF, DOCX, TXT, HTML.'); return; }

      if (!useAI) { onFileUpload(file, false, null); return; }

      const effectiveApiKey = apiKey || localStorage.getItem("geminiApiKey");
      if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
        setError('Please configure your API key first (click Configure API).'); return;
      }

      startLoading();
      const llmService = new LLMService(effectiveApiKey, baseUrl);
      const questions = await llmService.generateQuizQuestions(file, aiOptions);
      onFileUpload(questions, true, aiOptions);

    } catch (err) { console.error('Error processing file:', err); setError(err?.message || 'Failed to process file.'); }
    finally { stopLoading(); }
  };

  const handleDrop = e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]); };
  const handleDragOver = e => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragOver(false); };

  const handleTextSubmit = async textContent => {
    if (busyRef.current) return;
    setError(null);
    try {
      if (!textContent?.trim()) { setError('Please paste some content first.'); return; }
      const wordCount = textContent.trim().split(/\s+/).length;
      if (wordCount < 10) { setError('Please enter at least 10 words of text to generate questions.'); return; }

      const effectiveApiKey = apiKey || localStorage.getItem("geminiApiKey");
      if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
        setError('Please configure your API key first (click Configure API).'); return;
      }

      startLoading();
      const llmService = new LLMService(effectiveApiKey, baseUrl);
      const questions = await llmService.generateQuizQuestions(textContent, aiOptions);
      onFileUpload(questions, true, aiOptions);

    } catch (err) { console.error('Error processing text:', err); setError(err?.message || 'Failed to process text.'); }
    finally { stopLoading(); setPastedText(''); setShowTextMode(false); }
  };

  return (
    <div className='upload-container'>
      <AppHeader onProfileClick={onProfileClick} setShowApiConfig={onReconfigure} />
      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {hasAI && (
        <AIConfigPanel
          useAI={useAI}
          setUseAI={setUseAI}
          aiOptions={aiOptions}
          setAiOptions={setAiOptions}
          effectiveLoading={effectiveLoading}
          onReconfigure={handleReconfigure}
          onSample={() => handleTextSubmit(SAMPLE_TEXT)}
        />
      )}

      <Dropzone
        dragOver={dragOver}
        effectiveLoading={effectiveLoading}
        fileName={fileName}
        fileSize={fileSize}
        fileType={fileType}
        onClear={clearSelectedFile}
        onFileClick={() => document.getElementById('file-input')?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      />

      <SampleTextButtons
        onSampleClick={() => handleTextSubmit(SAMPLE_TEXT)}
        onToggleTextMode={() => setShowTextMode(prev => !prev)}
        showTextMode={showTextMode}
        effectiveLoading={effectiveLoading}
      />

      <HiddenFileInput onFileSelect={handleFileSelect} effectiveLoading={effectiveLoading} />

      {showTextMode && (
        <TextModeInput
          pastedText={pastedText}
          setPastedText={setPastedText}
          onSubmit={handleTextSubmit}
          onCancel={() => { setShowTextMode(false); setPastedText(''); }}
          effectiveLoading={effectiveLoading}
        />
      )}
    </div>
  );
};

export default FileUpload;
