import { formatBytes } from "./utils";

const Dropzone = ({ dragOver, effectiveLoading, fileName, fileSize, fileType, onClear, onFileClick, onDrop, onDragOver, onDragLeave }) => {
  return (
    <div
      className={`dropzone ${dragOver ? "drag-active" : ""} ${effectiveLoading ? "loading" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onFileClick}
      role="button"
      tabIndex={0}
      aria-disabled={effectiveLoading}
    >
      {effectiveLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <h3>Generating MCQs…</h3>
          <p>We’re analyzing your document and creating questions. Please wait.</p>
        </div>
      ) : (
        <div className="upload-content">
          <span className="upload-icon">📁</span>
          <h3>{fileName ? `Selected: ${fileName}` : "Upload Your Document"}</h3>
          {!fileName && <p>Drag & drop your file here or click to browse</p>}
          {fileName && (
            <p>
              {formatBytes(fileSize)} • {fileType || "unknown type"}
              <button onClick={(e) => { e.stopPropagation(); onClear(); }}>✕</button>
            </p>
          )}
          <div className="supported-formats">
            <span>Supported formats: PDF, DOCX, TXT, HTML</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
