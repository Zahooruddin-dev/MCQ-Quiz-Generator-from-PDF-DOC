// Enhanced fileReader.js - Fixed version
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MAX_CHARS } from './constants.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Enhanced OCR with better language detection and content filtering
async function extractTextFromImagePDF(arrayBuffer, detectedLanguage = 'eng') {
	try {
		const formData = new FormData();
		const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

		// ✅ Provide filename so OCR.Space recognizes it as PDF
		formData.append('file', blob, 'upload.pdf');
		formData.append('language', detectedLanguage);
		formData.append('isOverlayRequired', 'false');
		formData.append('iscreatesearchablepdf', 'false');
		
		const response = await fetch('https://api.ocr.space/parse/image', {
			method: 'POST',
			headers: { apikey: 'helloworld' }, // replace with real key
			body: formData,
		});
		
		if (!response.ok) {
			throw new Error(`OCR service error: ${response.status}`);
		}
		
		const data = await response.json();
		if (data.IsErroredOnProcessing) {
			throw new Error('OCR processing failed: ' + (data.ErrorMessage || 'Unknown error'));
		}
		
		let text = '';
		if (data.ParsedResults?.length > 0) {
			text = data.ParsedResults.map((r) => r.ParsedText || '').join('\n\n');
		}
		
		if (!text || text.trim().length === 0) {
			throw new Error('No text could be extracted from the document');
		}
		
		const cleanedText = cleanOCRText(text);
		const contentAnalysis = analyzeContentQuality(cleanedText);
		
		if (contentAnalysis.isLikelyCopyrighted) {
			console.warn('⚠️ Warning: Content may contain copyrighted material');
		}
		if (contentAnalysis.isLikelyAdvertisement) {
			console.warn('📢 Warning: Content appears to contain promotional/advertising material');
		}
		if (contentAnalysis.hasLowQualityOCR) {
			console.warn('🔍 Warning: OCR quality appears low - text may contain recognition errors');
		}
		
		return cleanedText.trim();
		
	} catch (error) {
		console.error('OCR extraction failed:', error);
		throw new Error(
			'This PDF appears to be image-based and OCR extraction failed. Please try using a clearer scan or a text-based PDF.'
		);
	}
}

// Clean up OCR text artifacts and improve readability
function cleanOCRText(text) {
	if (!text) return '';
	
	return text
		.replace(/[^\w\s\.,;:!?'"()\-]/g, ' ')
		.replace(/\b[il1|O0]{2,}\b/gi, '')
		.replace(/https?:\/\/[^\s]+/gi, '')
		.replace(/www\.[^\s]+/gi, '')
		.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '')
		.replace(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '')
		.replace(/\s+/g, ' ')
		.replace(/\n\s*\n\s*\n/g, '\n\n')
		.trim();
}

// Analyze content quality and detect problematic material
function analyzeContentQuality(text) {
	const analysis = {
		isLikelyCopyrighted: false,
		isLikelyAdvertisement: false,
		hasLowQualityOCR: false,
		isEducationalContent: false
	};
	
	const textLower = text.toLowerCase();
	
	const copyrightPatterns = [
		/copyright|©|\(c\)|all rights reserved|proprietary|trademark|®|™/gi,
		/unauthorized reproduction|protected by copyright|intellectual property/gi
	];
	for (const pattern of copyrightPatterns) {
		if (pattern.test(textLower)) {
			analysis.isLikelyCopyrighted = true;
			break;
		}
	}
	
	const adPatterns = [
		/visit our website|call now|limited time|don't miss out|act now/gi,
		/discount|promo code|special offer|terms and conditions apply/gi,
		/follow us on|social media|facebook|twitter|instagram/gi
	];
	for (const pattern of adPatterns) {
		if (pattern.test(textLower)) {
			analysis.isLikelyAdvertisement = true;
			break;
		}
	}
	
	const educationalPatterns = [
		/question|answer|chapter|lesson|exercise|study|learn/gi,
		/university|college|school|course|academic|examination/gi
	];
	for (const pattern of educationalPatterns) {
		if (pattern.test(textLower)) {
			analysis.isEducationalContent = true;
			break;
		}
	}
	
	const ocrQualityPatterns = [
		/[^\w\s]{3,}/g,
		/\b[a-z]\b\s*\b[a-z]\b/gi,
		/\d{8,}/g
	];
	let qualityIssues = 0;
	for (const pattern of ocrQualityPatterns) {
		const matches = text.match(pattern);
		if (matches && matches.length > text.length / 500) {
			qualityIssues++;
		}
	}
	analysis.hasLowQualityOCR = qualityIssues >= 2;
	
	return analysis;
}

// Simple language detection for better OCR
function detectLanguageForOCR(text) {
	if (!text || text.length < 50) return 'eng';
	
	const scriptPatterns = {
		ara: /[\u0600-\u06FF]/g,
		hin: /[\u0900-\u097F]/g,
		chi_sim: /[\u4E00-\u9FFF]/g,
		jpn: /[\u3040-\u309F\u30A0-\u30FF]/g,
		kor: /[\uAC00-\uD7AF]/g,
		spa: /[ñáéíóúü]/gi,
		fre: /[àâçéèêëîïôûùüÿ]/gi,
		ger: /[äöüß]/gi,
		ita: /[àèéìíîòóùú]/gi,
		por: /[áàâãçéêíóôõú]/gi
	};
	
	let maxCount = 0;
	let detectedLang = 'eng';
	
	for (const [lang, pattern] of Object.entries(scriptPatterns)) {
		const matches = text.match(pattern);
		const count = matches ? matches.length : 0;
		if (count > maxCount && count > text.length * 0.1) {
			maxCount = count;
			detectedLang = lang;
		}
	}
	
	return detectedLang;
}

// MAIN EXPORT - Enhanced and fixed
export async function readFileContent(file) {
	try {
		// Text files
		if (
			file.type.includes('text') ||
			file.name.endsWith('.txt') ||
			file.name.endsWith('.html')
		) {
			const text = await file.text();
			return text.slice(0, MAX_CHARS);
		}
		
		// DOCX
		if (
			file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			file.name.endsWith('.docx')
		) {
			const arrayBuffer = await file.arrayBuffer();
			const mammoth = await import('mammoth/mammoth.browser.js');
			const { value } = await mammoth.extractRawText({ arrayBuffer });
			return value.slice(0, MAX_CHARS);
		}
		
		// PDF
		if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
			const arrayBuffer = await file.arrayBuffer();
			
			try {
				const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
				let text = '';
				let hasText = false;
				let processedPages = 0; // ✅ Fix: track last processed page
				
				console.log(`Processing PDF with ${pdf.numPages} pages...`);
				
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					
					if (content.items.length > 0) {
						hasText = true;
						const pageText = content.items.map((item) => item.str).join(' ');
						text += pageText + '\n';
					}
					
					processedPages = i; // ✅ Save last page
					
					if (text.length > MAX_CHARS * 1.5) {
						console.log(`Stopping at page ${i} due to length limit`);
						break;
					}
				}
				
				const cleanText = text.trim();
				const wordCount = cleanText.split(/\s+/).length;
				const avgWordsPerPage = wordCount / Math.min(pdf.numPages, processedPages); // ✅ Fixed
				
				if (hasText && cleanText.length > 0 && avgWordsPerPage > 15) {
					console.log(`Successfully extracted ${wordCount} words from PDF`);
					return cleanText.slice(0, MAX_CHARS);
				}
				
				console.log('No sufficient text found in PDF, attempting OCR...');
				const detectedLang = detectLanguageForOCR(cleanText);
				return (await extractTextFromImagePDF(arrayBuffer, detectedLang)).slice(0, MAX_CHARS);
				
			} catch (error) {
				console.error('PDF processing failed, attempting OCR:', error);
				const detectedLang = detectLanguageForOCR('');
				return (await extractTextFromImagePDF(arrayBuffer, detectedLang)).slice(0, MAX_CHARS);
			}
		}
		
		// Images
		if (file.type.startsWith('image/')) {
			const arrayBuffer = await file.arrayBuffer();
			const detectedLang = detectLanguageForOCR('');
			return (await extractTextFromImagePDF(arrayBuffer, detectedLang)).slice(0, MAX_CHARS);
		}
		
		throw new Error('Unsupported file type. Use TXT, HTML, DOCX, PDF, or image files.');
		
	} catch (error) {
		console.error('File reading error:', error);
		throw new Error(`File reading failed: ${error.message}`);
	}
}
