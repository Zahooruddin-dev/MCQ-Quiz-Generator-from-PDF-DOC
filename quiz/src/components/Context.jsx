import { useState } from 'react';

const Context = ({ context }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!context || context.trim() === '') return null;

	return (
		<div className='context-container'>
			<button
				className='context-toggle'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				{isExpanded ? 'Hide Context ▼' : 'Show Context ▶'}
			</button>
			{isExpanded && (
				<div className='context-content'>
					<blockquote>{context}</blockquote>
				</div>
			)}
		</div>
	);
};

export default Context;
