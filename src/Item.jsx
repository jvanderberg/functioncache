import React from 'react';
import { deleteItem } from './service';
export const Item = ({ index, item }) => (
	<div key={index}>
		<span>{item.description}</span>
		<span>
			<a onClick={() => deleteItem(item.id)}>[-]</a>
		</span>
	</div>
);
