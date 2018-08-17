import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import PouchDB from 'pouchdb';

const db = new PouchDB('http://localhost:5984/todo');

async function getDocs() {
	const docs = await db.allDocs({ include_docs: true });
	const items = docs.rows.map(item => item.doc);
	return items;
}
const getDocsCached = cacheAsync(getDocs);

export function cacheFunction(fn, maxEntries = 1) {
	let cache = {};
	const wrapped = function(...args) {
		const key = JSON.stringify(args);
		if (cache[key]) {
			return cache[key];
		}
		const result = fn.apply(null, args);
		if (result.then && typeof result.then === 'function') {
			//We have a promise, store the promise in the cache
			cache[key] = result;
			return result.then(function(value) {
				const entries = Object.keys(cache);
				if (entries.length === maxEntries) {
					delete cache[entries[0]];
				}
				cache[key] = value;
			});
		}
		return result;
	};
	wrapped.invalidate = function() {
		cache = {};
	};
	return wrapped;
}

export function cacheAsync(fn, maxEntries = 1) {
	const cached = cacheFunction(fn, maxEntries);
	const invalidate = cached.invalidate;
	let invalidatedResolve;
	let invalidatedReject;
	let invalidated = false;

	const wrapped = function(...args) {
		const result = cached.apply(null, args);
		if (result.then && typeof result.then === 'function') {
			if (invalidatedReject && !invalidated) {
				//Clean up old invalidation promise
				invalidatedReject();
			}
			result.invalidated = new Promise((resolve, reject) => {
				invalidatedResolve = resolve;
				invalidatedReject = reject;
			});
			invalidated = false;
			throw result;
		}
		return result;
	};
	wrapped.invalidate = function() {
		invalidate();
		invalidated = false;
		invalidatedResolve();
	};
	return wrapped;
}

const Items = ({ refresh }) => {
	const result = getDocsCached('dummy');
	return (
		<div className="App">
			<header className="App-header">TODO</header>
			<p className="App-intro">Items</p>
			{result.map((item, index) => (
				<div>
					<span>
						{index}
						.&nbsp;
					</span>
					<span>{item.description}</span>
				</div>
			))}
			<button onClick={() => getDocsCached.invalidate()}>Refresh</button>
		</div>
	);
};

class App extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	componentDidCatch(error) {
		if (error.then && typeof error.then === 'function') {
			error.then(() => this.setState({ hasError: false }));
			if (error.invalidated && error.invalidated.then && typeof error.invalidated.then === 'function') {
				error.invalidated.then(invalidatedNew => {
					this.forceUpdate();
				});
			}
		}
		this.setState({ hasError: true });
	}
	render() {
		return (
			!this.state.hasError && (
				<Items
					refresh={() => {
						this.forceUpdate();
					}}
				/>
			)
		);
	}
}

export default App;
