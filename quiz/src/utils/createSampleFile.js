const fs = require('fs');

const sampleContent = `Q1. What is the capital of France?
a) London
b) Berlin
c) Paris
d) Madrid
Answer: c

Q2. Which programming language is React built with?
a) Python
b) JavaScript
c) Java
d) C++
Answer: b

Q3. What does HTML stand for?
a) Hyper Text Markup Language
b) High Tech Modern Language
c) Hybrid Text Managing Language
d) Hyper Transfer Machine Language
Answer: a`;

fs.writeFileSync('sample-quiz.txt', sampleContent);