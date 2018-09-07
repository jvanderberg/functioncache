import React from 'react';
import './App.css';
import { PlaceHolder } from './PlaceHolder';
import { TodoList } from './List';
import { FormState } from './FormState';
import TextField from '@material-ui/core/TextField';
import { addItem, searchListCached } from './service';
import { Card, CardContent, CardActions, Button, CircularProgress } from '@material-ui/core';
const Waiting = () => (
	<div>
		<CircularProgress size={100} />
	</div>
);

const AddItem = ({ description, descriptionChanged }) => (
	<div>
		<TextField
			id="add"
			value={description || ''}
			label="Add TODO"
			onChange={e => descriptionChanged(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Enter') {
					addItem({ description });
					descriptionChanged('');
				}
			}}
			type="search"
			margin="normal"
		/>
	</div>
);
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
			<TodoList search={search} />
		</PlaceHolder>

		<FormState name="description">{AddItem}</FormState>
	</div>
);

const App = () => (
	<div style={{ display: 'flex' }}>
		<Card style={{ flex: 1 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1 }}>
			<CardContent>
				<FormState name="search">{Search}</FormState>
			</CardContent>
			<CardActions>
				<Button onClick={() => searchListCached.invalidate()}>Refresh</Button>
			</CardActions>
		</Card>
		<Card style={{ flex: 1 }}>
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
