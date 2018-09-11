import React from 'react';
import { TextField } from '@material-ui/core';
import { addItem } from './service';
export const AddItem = ({ description, descriptionChanged }) => (
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
