// quizValidator.js
export function shuffleArray(array) {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

export function validateQuestions(questions) {
	return questions.map((q, index) => {
		if (!q.question || q.question.length < 10)
			throw new Error(`Question ${index + 1} is too short.`);
		const uniqueOptions = [...new Set(q.options.map((opt) => opt.trim()))];
		if (uniqueOptions.length !== 4)
			throw new Error(`Question ${index + 1} has duplicate options.`);
		if (q.correctAnswer < 0 || q.correctAnswer > 3)
			throw new Error(
				`Question ${index + 1} has invalid correctAnswer index.`
			);
		if (!q.options[q.correctAnswer])
			throw new Error(
				`Question ${index + 1} has correctAnswer index mismatch.`
			);
		return q;
	});
}