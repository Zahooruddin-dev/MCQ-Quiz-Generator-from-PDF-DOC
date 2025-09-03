import { useState } from 'react';

const Context = ({ context }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="context-card">
			<button
				className="context-toggle"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? 'Hide Context ▲' : 'Show Context ▼'}
			</button>

			{isOpen && (
				<div className="context-content">
					<p>{context}</p>
				</div>
			)}
		</div>
	);
};

export default Context;
