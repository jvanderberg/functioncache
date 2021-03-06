import React from 'react';
import './App.css';
import { PlaceHolder } from './PlaceHolder';
import { FormState } from './FormState';
import TextField from '@material-ui/core/TextField';
import { searchListCached, getTodoListComponent } from './service';
import { Card, CardContent, CardActions, Button } from '@material-ui/core';
import { AddItem } from './AddItem';
import { Waiting } from './Waiting';

const Search = ({ search, searchChanged }) => (
	<div>
		<TextField
			id="search"
			value={search || ''}
			label="Search TODOs"
			onChange={e => searchChanged(e.target.value)}
			type="search"
			margin="normal"
		/>
		<PlaceHolder alternate={Waiting}>
			{({ subscribe }) => {
				const TodoList = subscribe(getTodoListComponent, () => <div />)();
				const result = subscribe(searchListCached)(search);
				return <TodoList items={result} />;
			}}
		</PlaceHolder>

		<FormState name="description">{AddItem}</FormState>
	</div>
);

const App = () => (
	<div style={{ display: 'flex' }}>
		<Card style={{ flex: 1, maxWidth: 400 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1, maxWidth: 400 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1, maxWidth: 400 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1, maxWidth: 400 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
	</div>
);

export default App;
