import React from 'react';
export const Item = ({ index, item }) => (
	<div key={index}>
		<span>
			{index}
			.&nbsp;
		</span>
		<span>{item.description}</span>
	</div>
);
