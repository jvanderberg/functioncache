import React, { Fragment } from 'react';

import { searchListCached, deleteItem } from './service';
import List from '@material-ui/core/List';
import { ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export const TodoList = ({ subscribe, search }) => {
	const result = subscribe(searchListCached)(search);
	return (
		<Fragment>
			<List>
				{result.map((item, index) => (
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
		</Fragment>
	);
};
