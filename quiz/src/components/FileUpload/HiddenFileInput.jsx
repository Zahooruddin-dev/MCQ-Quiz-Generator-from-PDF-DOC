import React from 'react';

const HiddenFileInput = ({ onFileSelect, effectiveLoading }) => {
  return (
    <input
      id="file-input"
      type="file"
      accept=".txt,.docx,.doc,.html,.pdf"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) onFileSelect(file);
        e.target.value = ''; // allow re-uploading same file
      }}
      disabled={effectiveLoading}
      style={{ display: 'none' }}
    />
  );
};

export default HiddenFileInput;