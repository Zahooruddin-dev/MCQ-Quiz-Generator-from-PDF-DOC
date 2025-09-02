// components/QuizEngine.jsx
import { useState } from 'react';
import Context from './Context';

const QuizEngine = ({ questions, onFinish }) => {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userAnswers, setUserAnswers] = useState(
		new Array(questions.length).fill(null)
	);

	const handleAnswerSelect = (index) => {
		const newAnswers = [...userAnswers];
		newAnswers[currentQuestion] = index;
		setUserAnswers(newAnswers);
	};

	const goToNextQuestion = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1);
		}
	};

	const goToPrevQuestion = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	const handleFinish = () => {
		onFinish(userAnswers);
	};

	const calculateProgress = () => {
		const answered = userAnswers.filter((answer) => answer !== null).length;
		return (answered / questions.length) * 100;
	};

	return (
		<div className='quiz-container'>
			<div className='quiz-header'>
				<h2>Interactive Quiz</h2>
				<div className='progress-bar'>
					<div
						className='progress-fill'
						style={{ width: `${calculateProgress()}%` }}
					></div>
				</div>
				<div className='quiz-info'>
					<span>
						Question {currentQuestion + 1} of {questions.length}
					</span>
					<span>
						{userAnswers.filter((answer) => answer !== null).length} answered
					</span>
				</div>
			</div>

			<div className='question'>
				<div className='question-number'>Question {currentQuestion + 1}</div>
				<div className='question-text'>
					{questions[currentQuestion].question}
				</div>

				<Context context={questions[currentQuestion].context} />

				<div className='options'>
					{questions[currentQuestion].options.map((option, index) => (
						<div
							key={index}
							className={`option ${
								userAnswers[currentQuestion] === index ? 'selected' : ''
							}`}
							onClick={() => handleAnswerSelect(index)}
						>
							{String.fromCharCode(97 + index)}) {option}
						</div>
					))}
				</div>
			</div>

			<div className='navigation'>
				<button
					className='btn btn-secondary'
					onClick={goToPrevQuestion}
					disabled={currentQuestion === 0}
				>
					Previous
				</button>

				{currentQuestion < questions.length - 1 ? (
					<button className='btn' onClick={goToNextQuestion}>
						Next
					</button>
				) : (
					<button className='btn' onClick={handleFinish}>
						Finish Quiz
					</button>
				)}
			</div>
		</div>
	);
};

export default QuizEngine;
