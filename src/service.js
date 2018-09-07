import { get, mockDB, put, remove } from './mockDB';
import { memoizeAsync } from './memoize';

mockDB(
	{
		0: { order: 1, description: 'Buy milk', id: 0 },
		1: { order: 0, description: 'Call Bob', done: true, id: 1 }
	},
	2,
	250
);

async function getList() {
	const docs = await get();
	const items = Object.keys(docs).map(key => docs[key]);
	return items;
}
export const getListCached = memoizeAsync(getList, 30);

async function searchList(search) {
	const docs = await get();
	const items = Object.keys(docs).map(key => docs[key]);
	const found = items.filter(i => {
		const item = i.description || '';
		return item.toUpperCase().includes((search || '').toUpperCase());
	});
	debugger;
	return found;
}

export const searchListCached = memoizeAsync(searchList, 30);

export async function addItem({ description }) {
	getListCached.invalidate();
	searchListCached.invalidate();
	const item = await put({ description, order: 0 });
	return item;
}

export async function deleteItem(id) {
	getListCached.invalidate();
	searchListCached.invalidate();
	await remove(id);
	return true;
}
