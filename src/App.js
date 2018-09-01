import React from 'react';
import './App.css';
import { PlaceHolder } from './PlaceHolder';
import { List } from './List';

const Waiting = () => <div> WAITING... </div>;

const App = () => (
	<div className="App">
		<header className="App-header">TODO</header>
		<p className="App-intro">Items</p>
		<PlaceHolder alternate={Waiting} content={List} />
	</div>
);

export default App;
