import { memoizeAsync, INVALIDATED, EXPIRED, CANCELLED } from './memoize';
import { mockDB, put, get, find, remove, update } from './mockDB';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('Adding items', async () => {
	let db = mockDB();
	await put({ order: 1, description: 'Buy milk' });
	await put({ order: 2, description: 'Call Nan' });
	const state = await get();
	expect(state).toEqual({
		0: { order: 1, description: 'Buy milk', id: 0 },
		1: { order: 2, description: 'Call Nan', id: 1 }
	});
});

test('Updating items', async () => {
	let db = mockDB();
	await put({ order: 1, description: 'Buy milk' });
	const item = await put({ order: 2, description: 'Call Nan' });
	item.order = 0;
	item.description = 'Call Bob';
	item.done = true;
	update(item);
	const state = await get();
	expect(state).toEqual({
		0: { order: 1, description: 'Buy milk', id: 0 },
		1: { order: 0, description: 'Call Bob', done: true, id: 1 }
	});
});

test('Adding items with id', async () => {
	let db = mockDB();
	await put({ id: 'one', order: 1, description: 'Buy milk' });
	await put({ id: 'two', order: 2, description: 'Call Nan' });
	const state = await get();
	expect(state).toEqual({
		one: { order: 1, description: 'Buy milk', id: 'one' },
		two: { order: 2, description: 'Call Nan', id: 'two' }
	});
});

test('Getting items', async () => {
	const db = mockDB();
	await put({ order: 1, description: 'Buy milk' });
	await put({ order: 2, description: 'Call Nan' });
	const state = await get(0);
	expect(state).toEqual({ order: 1, description: 'Buy milk', id: 0 });
});

test('Deleting items by object', async () => {
	const db = mockDB();
	await put({ order: 1, description: 'Buy milk' });
	const item = await put({ order: 2, description: 'Call Nan' });
	await remove(item);
	expect(await get()).toEqual({ 0: { order: 1, description: 'Buy milk', id: 0 } });
});

test('Deleting items by id', async () => {
	const db = mockDB();
	await put({ order: 1, description: 'Buy milk' });
	const item = await put({ order: 2, description: 'Call Nan' });
	await remove(item.id);
	expect(await get()).toEqual({ 0: { order: 1, description: 'Buy milk', id: 0 } });
});

test('Finding items', async () => {
	const db = mockDB();
	for (let i = 0; i < 20; i++) {
		await put({ order: i, description: `Buy milk ${i}` });
	}
	const results = await find(item => item.order > 10 && item.order < 13);
	expect(results).toEqual([
		{ order: 11, description: 'Buy milk 11', id: 11 },
		{ order: 12, description: 'Buy milk 12', id: 12 }
	]);
});
