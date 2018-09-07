import React, { Fragment } from 'react';

import { Item } from './Item';
import { getListCached, addItem, deleteItem } from './service';
import { FormState } from './FormState';
import List from '@material-ui/core/List';
import { ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export const TodoList = ({ subscribe, search }) => {
	const result = subscribe(getListCached)(search);
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
