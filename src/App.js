import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import PouchDB from 'pouchdb';
import { memoizeAsync } from './memoize';
import { PlaceHolder } from './PlaceHolder';

const db = new PouchDB('http://localhost:5984/todo');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getDocs() {
	const docs = await db.allDocs({ include_docs: true });
	await wait(5000);
	const items = docs.rows.map(item => item.doc);

	return items;
}

const getDocsCached = memoizeAsync(getDocs, 1);

const Items = fetch => () => {
	const result = fetch('dummy');

	return (
		<div className="App">
			<header className="App-header">TODO</header>
			<p className="App-intro">Items</p>
			{result.map((item, index) => (
				<div key={index}>
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

const Waiting = () => <div> WAITING... </div>;
const Bound = Items(getDocsCached);
const App = () => (
	<PlaceHolder alternate={Items(() => [])}>
		<div />
		<Bound />
	</PlaceHolder>
);

export default App;
