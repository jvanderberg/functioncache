import React, { Fragment } from 'react';

import { Item } from './Item';
import { getListCached, addItem } from './service';
import { FormState } from './FormState';

const AddItem = ({ description, descriptionChanged }) => (
	<div>
		<input type="text" value={description} onChange={descriptionChanged} />
		<button onClick={() => addItem({ description })}>Done</button>
	</div>
);

export const List = ({ adding, toggleAdding }) => {
	const result = getListCached('dummy');
	return (
		<Fragment>
			{result.map((item, index) => (
				<Item index={index} item={item} />
			))}
			<button onClick={() => getListCached.invalidate()}>Refresh</button>
			<button onClick={() => toggleAdding()}>Add</button>
			<FormState name="description">{AddItem}</FormState>
		</Fragment>
	);
};
