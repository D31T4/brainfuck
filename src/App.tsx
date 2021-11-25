
import React, { useCallback, useRef, useState } from 'react';
import './App.css';

import ErrorMessage from './components/error message';
import Spinner from './components/spinner';

import Interpreter from './interpreter';

const App: React.FC = () => {
	const [output, setOutput] = useState<{ text: string, error: boolean, time: number } | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const loadingRef = useRef<boolean>(loading);
	loadingRef.current = loading;

	const codeRef = useRef<HTMLTextAreaElement>(null),
		inputRef = useRef<HTMLTextAreaElement>(null);

	const interpreterRef = useRef<Interpreter>();

	const onClick: React.MouseEventHandler = useCallback(async () => {
		if (!codeRef.current || !inputRef.current) return;

		if (loadingRef.current) {
			interpreterRef.current?.halt();
			return;
		}

		setLoading(true);
		setOutput(null);

		const code = codeRef.current.value,
			input = inputRef.current.value;

		try {
			const interpreter = interpreterRef.current = new Interpreter(code, input);

			const time = performance.now();
			interpreter.run()
				.then(text => {
					setOutput({
						text,
						error: false,
						time: performance.now() - time
					});

					setLoading(false);
				})
				.catch((error: Error) => {
					setOutput({
						text: error.message,
						error: true,
						time: performance.now() - time
					});

					setLoading(false);
				});
		} catch (error) {
			setOutput({
				text: (error as Error).message,
				error: true,
				time: 0
			});

			setLoading(false);
		}
	}, []);

	return (
		<div className="app">
			<header className="app-header">
				Brainfuck interpreter
			</header>
			<div>
				a toy interpreter of <a href="https://en.wikipedia.org/wiki/Brainfuck" target="_blank">brainfuck</a>.
			</div>
			<hr />

			<div className="input">
				<div className="input-group">
					<label>code</label>
					<textarea
						disabled={loading}
						ref={codeRef}
						rows={5}
						spellCheck={false}
					/>
				</div>
				<div className="input-group">
					<label>input</label>
					<textarea
						disabled={loading}
						ref={inputRef}
						rows={3}
						spellCheck={false}
					/>
				</div>
			</div>
			<div className="action">
				<button onClick={onClick}>{loading ? 'cancel' : 'run'}</button>
			</div>

			<hr />
			<div className="output">
				{loading && <Spinner />}
				{output && <Output error={output.error} text={output.text} time={output.time} />}
			</div>
		</div>
	);
}

export default App;

const Output: React.FC<{ error: boolean, text: string, time: number }> = props => {
	return (<>
		<div>{props.error ? 'Error' : 'Output'}:</div>
		{props.error ? 
			<ErrorMessage>{props.text}</ErrorMessage> :
			<span>{props.text}</span>
		}
		<div style={{ fontFamily: 'monospace' }}>time: {props.time} ms</div>
	</>);
};
