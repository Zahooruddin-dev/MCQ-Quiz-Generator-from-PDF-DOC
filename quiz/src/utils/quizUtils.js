// quizUtils.js
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function validateQuestions(questions) {
  return questions.map((q, i) => {
    if (!q.question || q.options.length !== 4)
      throw new Error(`Invalid question at index ${i}`);
    return q;
  });
}
