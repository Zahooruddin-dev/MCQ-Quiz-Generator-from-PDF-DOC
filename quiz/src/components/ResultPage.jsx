import { useState } from "react";

const ResultPage = ({ questions, userAnswers, onNewQuiz, fileName }) => {
	if (!questions || !userAnswers) {
		return (
			<div className='results-container'>
				<div className='results-header'>
					<h2>No Results Available</h2>
					<button className='btn' onClick={onNewQuiz}>
						Start New Quiz
					</button>
				</div>
			</div>
		);
	}

	const calculateResults = () => {
		let correct = 0;
		let wrong = 0;
		let unattempted = 0;

		userAnswers.forEach((answer, index) => {
			if (answer === null) {
				unattempted++;
			} else if (answer === questions[index].correctAnswer) {
				correct++;
			} else {
				wrong++;
			}
		});

		return {
			correct,
			wrong,
			unattempted,
			score: (correct / questions.length) * 100,
		};
	};

	const results = calculateResults();

	// State to handle collapse/expand per question
	const [expandedIndex, setExpandedIndex] = useState(null);

	const toggleExpand = (index) => {
		setExpandedIndex(expandedIndex === index ? null : index);
	};

	return (
		<div className='results-container'>
			<div className='results-header'>
				<h2>Quiz Results</h2>
				<p>File: {fileName || "Unknown File"}</p>
			</div>

			<div className='score-display'>
				<div className='score-circle'>
					<span className='score-value'>{results.score.toFixed(1)}%</span>
				</div>
				<p className='score-label'>Overall Score</p>
			</div>

			<div className='stats'>
				<div className='stat correct'>
					<span className='stat-value'>{results.correct}</span>
					<span className='stat-label'>Correct</span>
				</div>
				<div className='stat wrong'>
					<span className='stat-value'>{results.wrong}</span>
					<span className='stat-label'>Wrong</span>
				</div>
				<div className='stat unattempted'>
					<span className='stat-value'>{results.unattempted}</span>
					<span className='stat-label'>Unattempted</span>
				</div>
			</div>

			<div className='review-section'>
				<h3>Question Review</h3>
				{questions.map((question, index) => {
					const userAnswerIndex = userAnswers[index];
					const isCorrect =
						userAnswerIndex !== null &&
						userAnswerIndex === question.correctAnswer;

					const isExpanded = expandedIndex === index;

					return (
						<div key={index} className='review-question'>
							<div
								className='review-question-header'
								onClick={() => toggleExpand(index)}
							>
								<span>Question {index + 1}</span>
								<span
									className={`status ${isCorrect ? "correct" : "incorrect"}`}
								>
									{userAnswerIndex === null
										? "Unattempted"
										: isCorrect
										? "Correct"
										: "Incorrect"}
								</span>
								<span className='toggle-icon'>
									{isExpanded ? "▲" : "▼"}
								</span>
							</div>

							{isExpanded && (
								<div className='review-body'>
									<div className='review-question-text'>{question.question}</div>
									<div className='review-options'>
										{question.options.map((option, optIndex) => {
											let className = "review-option";
											if (optIndex === question.correctAnswer) {
												className += " correct-answer";
											} else if (userAnswerIndex === optIndex) {
												className += " user-answer";
											}

											return (
												<div key={optIndex} className={className}>
													{String.fromCharCode(97 + optIndex)}) {option}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div className='actions'>
				<button className='btn' onClick={onNewQuiz}>
					Start New Quiz
				</button>
			</div>
		</div>
	);
};

export default ResultPage;
