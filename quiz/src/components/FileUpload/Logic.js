import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useFileUploadLogic = (onFileUpload, hasAI, apiKey, baseUrl) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { deductCredits } = useAuth();

  const handleFileSelect = async (selectedFile) => {
    try {
      setFile(selectedFile);
      setError(null);
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        throw new Error('Please upload a PDF or Word document');
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const processFile = async () => {
    if (!file || !hasAI) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apiKey', apiKey);

      const response = await fetch(`${baseUrl}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const questions = await response.json();
      
      // Deduct credits after successful processing
      await deductCredits();
      
      // Call the parent component's callback
      onFileUpload(questions);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    loading,
    error,
    handleFileSelect,
    processFile,
    setError
  };
};