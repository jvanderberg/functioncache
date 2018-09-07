import { memoizeAsync, INVALIDATED, EXPIRED, CANCELLED, VALID } from './memoize';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getLater(ms, value) {
	await wait(ms);
	return value;
}

test('memoize async', async () => {
	const cached = memoizeAsync(getLater);
	const responses = [];
	cached.subscribe(event => {
		responses.push(event);
	});
	//	catchErrors(done, async () => {
	let result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	//Calling before resolution show re-throw the same promise
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	await wait(200);
	//Result has resolved, call returns sync
	result = cached(100, 2);
	expect(result).toBe(2);

	//New parms, not cached, should throw
	result = cached(100, 3);
	await wait(200);

	//Result has resolved, call returns cached sync
	result = cached(100, 3);
	expect(result).toBe(3);

	//Old cache should be invalidated
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	await wait(200);

	//Explicitly invalidate
	cached.invalidate();
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	await wait(200);
	expect(responses).toEqual([VALID, VALID, VALID, INVALIDATED, VALID]);
});

test('test subscription invalidate/cancel before fetch complete', async () => {
	const cached = memoizeAsync(getLater);
	expect(cached.subscribers().size).toBe(0);
	let result;
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	const responses = [];
	cached.subscribe(event => {
		responses.push(event);
	});
	setTimeout(() => cached.invalidate(), 50);

	let first = await wait(200);
	expect(responses).toEqual([INVALIDATED, CANCELLED]);
});

test('test subscription invalidate after fetch complete', async () => {
	const cached = memoizeAsync(getLater);
	expect(cached.subscribers().size).toBe(0);
	let result;
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	const responses = [];
	cached.subscribe(event => {
		responses.push(event);
	});
	setTimeout(() => cached.invalidate(), 150);

	let first = await wait(200);
	expect(responses).toEqual([VALID, INVALIDATED]);
});

test('test subscription invalidation', async () => {
	const cached = memoizeAsync(getLater);
	expect(cached.subscribers().size).toBe(0);
	const responses = [];
	cached.subscribe(event => {
		responses.push(event);
	});
	expect(cached.subscribers().size).toBe(1);
	let result;
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	cached.invalidate();
	expect(responses).toEqual([INVALIDATED]);
});

test('memoize returns same promise', async () => {
	const cached = memoizeAsync(getLater);
	let result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	let result2 = cached(100, 2);
	expect(result).toBe(result2);
});

test('memoize async invalidate before done', async () => {
	const cached = memoizeAsync(getLater);

	let result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	cached.invalidate();
	await wait(200);
	//Even after resolve, the result is not cached
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
});

test('memoize async invalidate before done, testing cancellation of pending result', async () => {
	const cached = memoizeAsync(getLater);

	let result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	await wait(80);
	cached.invalidate();
	//Call it again
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	await wait(80);
	//We've waiting long enough for the first result to come back, but it should be rejected, so a second call should still throw
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	cached.invalidate();
	await wait(200);

	//Even after resolve, the result is not cached
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');
});

test('memoize async with two entries', async () => {
	const cached = memoizeAsync(getLater, 2);
	let result = cached(100, 2);
	expect(typeof result.then).toBe('function');
	await wait(200);
	//Result has resolved, call returns sync
	result = cached(100, 2);
	expect(result).toBe(2);

	//New parms, not cached, should throw
	result = cached(100, 3);
	expect(typeof result.then).toBe('function');
	await wait(200);

	//Result has resolved, call returns cached3 sync
	result = cached(100, 3);
	expect(result).toBe(3);

	//Old cache should still be there
	result = cached(100, 2);
	expect(result).toBe(2);

	result = cached(100, 4);
	expect(typeof result.then).toBe('function');
	await wait(200);
	//Result has resolved, call returns cached sync
	result = cached(100, 3);
	expect(result).toBe(3);

	//First result should be evicted
	result = cached(100, 2);
	expect(typeof result.then).toBe('function');

	//Explicitly invalidate
	cached.invalidate();
	result = cached(100, 4);
	expect(typeof result.then).toBe('function');
});
