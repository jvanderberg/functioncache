import React from 'react';

import { deleteItem } from './service';
import List from '@material-ui/core/List';
import { ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export const TodoList = ({ items }) => (
	<List>
		{items.map((item, index) => (
			<ListItem index={index}>
				<ListItemText primary={item.description} />
				<ListItemSecondaryAction>
					<IconButton aria-label="Comments">
						<DeleteIcon onClick={() => deleteItem(item.id)} />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
		))}
	</List>
);
