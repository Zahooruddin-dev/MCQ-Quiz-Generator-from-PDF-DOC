// components/FileUpload.jsx
import { useState } from 'react'

const FileUpload = ({ onFileUpload }) => {
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setLoading(true)
      onFileUpload(file)
      setLoading(false)
    } else {
      alert('Please select a PDF or DOCX file.')
    }
  }

  return (
    <div className="upload-section">
      <div 
        className={`upload-box ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your file...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <h3>Click to upload or drag and drop</h3>
            <p>Supported formats: PDF, DOCX</p>
          </>
        )}
      </div>
      
      <input
        id="file-input"
        type="file"
        className="file-input"
        accept=".pdf,.docx"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0])
          }
        }}
      />
    </div>
  )
}

export default FileUpload