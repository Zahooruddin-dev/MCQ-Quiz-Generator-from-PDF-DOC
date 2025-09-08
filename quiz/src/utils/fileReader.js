// fileReader.js
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MAX_CHARS } from './constants.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

async function extractTextFromImagePDF(arrayBuffer) {
	try {
		const formData = new FormData();
		const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
		formData.append('file', blob);
		formData.append('language', 'eng');
		const response = await fetch('https://api.ocr.space/parse/image', {
			method: 'POST',
			headers: { apikey: 'helloworld' },
			body: formData,
		});
		const data = await response.json();
		if (data.IsErroredOnProcessing)
			throw new Error('OCR processing failed: ' + data.ErrorMessage);
		let text = '';
		if (data.ParsedResults?.length > 0)
			text = data.ParsedResults.map((r) => r.ParsedText).join('\n\n');
		return text.trim();
	} catch (error) {
		console.error('OCR extraction failed:', error);
		throw new Error(
			'This PDF appears to be image-based. Please use a text-based PDF or convert images to text first.'
		);
	}
}

export async function readFileContent(file) {
	try {
		if (
			file.type.includes('text') ||
			file.name.endsWith('.txt') ||
			file.name.endsWith('.html')
		) {
			return await file.text();
		}
		if (
			file.type ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.name.endsWith('.docx')
		) {
			const arrayBuffer = await file.arrayBuffer();
			const mammoth = await import('mammoth/mammoth.browser.js');
			const { value } = await mammoth.extractRawText({ arrayBuffer });
			return value;
		}
		if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
			const arrayBuffer = await file.arrayBuffer();
			try {
				const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
					.promise;
				let text = '',
					hasText = false;
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					if (content.items.length > 0) {
						hasText = true;
						text += content.items.map((it) => it.str).join(' ') + '\n';
					}
					if (text.length > MAX_CHARS * 1.5) break;
				}
				if (hasText && text.trim().length > 0) return text.trim();
				console.log('No text found in PDF, attempting OCR...');
				return await extractTextFromImagePDF(arrayBuffer);
			} catch (error) {
				console.error('PDF processing failed, attempting OCR:', error);
				return await extractTextFromImagePDF(arrayBuffer);
			}
		}
		throw new Error('Unsupported file type. Use TXT, HTML, DOCX, or PDF.');
	} catch (error) {
		console.error('File reading error:', error);
		throw new Error(`File reading failed: ${error.message}`);
	}
}