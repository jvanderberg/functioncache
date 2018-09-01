import { get, mockDB, put, remove } from './mockDB';
import { memoizeAsync } from './memoize';

mockDB(
	{
		0: { order: 1, description: 'Buy milk', id: 0 },
		1: { order: 0, description: 'Call Bob', done: true, id: 1 }
	},
	2,
	500
);

async function getList() {
	const docs = await get();
	const items = Object.keys(docs).map(key => docs[key]);
	return items;
}

export const getListCached = memoizeAsync(getList, 1);

export function addItem({ description }) {
	getListCached.runAndInvalidate(async () => {
		const item = await put({ description, order: 0 });
		return item;
	});
}

export function deleteItem(id) {
	getListCached.runAndInvalidate(async () => {
		const item = await remove(id);
		return true;
	});
}
