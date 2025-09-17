import React from 'react';
import { FileType, FileText, Type, File } from 'lucide-react';

/**
 * Returns an appropriate file icon based on MIME type or file type string.
 * @param {string} type - The file type or MIME type string.
 * @returns {JSX.Element} An icon component.
 */
export const getFileIcon = (type) => {
  const t = (type || '').toLowerCase();

  if (t.includes('pdf')) return <FileType size={40} />;
  if (t.includes('word') || t.includes('document') || t.includes('msword'))
    return <FileText size={40} />;
  if (t.includes('text') || t.includes('plain')) return <Type size={40} />;

  return <File size={40} />;
};
