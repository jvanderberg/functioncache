import { memoizeAsync, INVALIDATED, EXPIRED, CANCELLED } from './memoize';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getLater(ms, value) {
	await wait(ms);
	return value;
}

let singleValue;

async function getSingleValue(ms) {
	await wait(ms);
	return singleValue;
}

async function putSingleValue(ms, value) {
	await wait(ms);
	singleValue = value;
}

function catchErrors(done, callback) {
	return function() {
		try {
			callback.apply(this, arguments);
		} catch (e) {
			done.fail(e);
		}
	};
}
test('memoize async', async () => {});

let cached = memoizeAsync(getLater);
test('memoize async', async () => {
	//	catchErrors(done, async () => {
	expect(() => cached(100, 2)).toThrow();
	// //Calling before resolution show re-throw the same promise
	expect(() => cached(100, 2)).toThrow();

	await wait(200);
	//Result has resolved, call returns sync
	let result = cached(100, 2);
	expect(result).toBe(2);

	//New parms, not cached, should throw
	expect(() => cached(100, 3)).toThrow();
	await wait(200);

	//Result has resolved, call returns cached sync
	result = cached(100, 3);
	expect(result).toBe(3);

	//Old cache should be invalidated
	expect(() => cached(100, 2)).toThrow();

	await wait(200);

	//Explicitly invalidate
	cached.invalidate();
	expect(() => cached(100, 2)).toThrow();
});

test('memoize invalidated handler', async () => {
	cached = memoizeAsync(getLater);
	let result;
	try {
		cached(100, 2);
	} catch (promise) {
		try {
			cached(100, 2);
		} catch (promise2) {
			//Before resolved, should always return the same promise
			expect(promise2).toBe(promise);
			setTimeout(() => cached.invalidate(), 100);
			const res = await promise.invalidated;
			const res2 = await promise2.invalidated;
			expect(res).toBe(INVALIDATED);
			expect(res2).toBe(INVALIDATED);
		}
	}
	await wait(200);
});

test('memoize runAndInvalidate', async () => {
	let singleValue = memoizeAsync(getSingleValue);
	await putSingleValue(100, 42);
	let result;
	try {
		result = singleValue(50);
	} catch (e) {
		await wait(100);
		result = singleValue(50);
		expect(result).toBe(42);
		singleValue.runAndInvalidate(async () => {
			await putSingleValue(100, 43);
		});
		try {
			result = singleValue(50);
		} catch (e) {
			await wait(200);
			result = singleValue(50);
			expect(result).toBe(43);
		}
	}
});

let cachedInv = memoizeAsync(getLater);
test('memoize invalidated handler rejecting', async () => {
	try {
		cachedInv(100, 2);
	} catch (promise) {
		promise.then(async () => {
			//Result has resolved, call returns sync
			let result = cachedInv(100, 2);
			expect(result).toBe(2);

			//New parms, not cached, should throw
			expect(() => cachedInv(100, 3)).toThrow();
			await wait(200);

			//Result has resolved, call returns cached sync
			result = cachedInv(100, 3);
			expect(result).toBe(3);
		});
		try {
			await promise.invalidated;
		} catch (e) {
			expect(e).toBe(EXPIRED);
		}
	}
});

test('memoize promise cancellation', async () => {
	let cachedInv = memoizeAsync(getLater);
	//This will run after the call in the try block has executed
	setTimeout(() => cachedInv.invalidate(), 10);
	try {
		cachedInv(100, 2);
	} catch (promise) {
		await expect(promise).rejects.toBe(CANCELLED);
	}
});

// const cached2 = memoizeAsync(getLater);
// test('memoize async invalidate before done', async () => {
// 	expect(() => cached2(100, 2)).toThrow();
// 	cached2.invalidate();
// 	await wait(200);
// 	//Even after resolve, the result is not cached
// 	expect(() => cached2(100, 2)).toThrow();
// });

// test('memoize async invalidate before done, testing cancellation of pending result', async () => {
// 	cached = memoizeAsync(getLater);
// 	expect(() => cached(100, 2)).toThrow();
// 	await wait(80);
// 	cached.invalidate();
// 	//Call it again
// 	expect(() => cached(100, 2)).toThrow();
// 	await wait(80);
// 	//We've waiting long enough for the first result to come back, but it should be rejected, so a second call should still throw
// 	expect(() => cached(100, 2)).toThrow();
// 	cached.invalidate();
// 	await wait(200);

// 	//Even after resolve, the result is not cached
// 	expect(() => cached(100, 2)).toThrow();
// });

// const cached3 = memoizeAsync(getLater, 2);
// test('memoize async with two entries', async () => {
// 	expect(() => cached3(100, 2)).toThrow();
// 	await wait(200);
// 	//Result has resolved, call returns sync
// 	let result = cached3(100, 2);
// 	expect(result).toBe(2);

// 	//New parms, not cached3, should throw
// 	expect(() => cached3(100, 3)).toThrow();
// 	await wait(200);

// 	//Result has resolved, call returns cached3 sync
// 	result = cached3(100, 3);
// 	expect(result).toBe(3);

// 	//Old cache should still be there
// 	result = cached3(100, 2);
// 	expect(result).toBe(2);

// 	expect(() => cached3(100, 4)).toThrow();
// 	await wait(200);
// 	//Result has resolved, call returns cached3 sync
// 	result = cached3(100, 3);
// 	expect(result).toBe(3);

// 	//First result should be evicted
// 	expect(() => cached3(100, 2)).toThrow();

// 	//Explicitly invalidate
// 	cached3.invalidate();
// 	expect(() => cached3(100, 4)).toThrow();
// });
