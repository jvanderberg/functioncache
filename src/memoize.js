export const INVALIDATED = Symbol('INVALIDATE');
export const EXPIRED = Symbol('EXPIRED');
export const CANCELLED = Symbol('CANCELLED');
export const PENDING = Symbol('PENDING');
export const VALID = Symbol('VALID');

function notify(subscribers, event) {
	for (const fn of subscribers.entries()) {
		fn[0](event);
	}
}
/**
 * Memoize a (potentially) async function.  If the function results are
 * already cached, return those results, if not, throw the promise returned
 * by the async function
 * @export
 * @param {*} fn The function to be memoized
 * @param {number} [maxEntries=1] The number of cached entries to keep
 * @returns Either the cached results or throws the promise returned by the
 * function call
 */
export function memoizeAsync(fn, maxEntries = 1) {
	let cache = {};
	let subscribers = new Set();
	const wrapped = function(...args) {
		let runFn = fn;
		const key = JSON.stringify(args);
		let result = cache[key];
		if (typeof result !== 'undefined') {
			return result;
		}

		result = runFn.apply(null, args);

		if (result.then && typeof result.then === 'function') {
			let cancelled = false;
			const promise = new Promise((resolve, reject) => {
				result.then(function(value) {
					if (!cancelled) {
						const entries = Object.keys(cache);
						if (entries.length === maxEntries + 1) {
							delete cache[entries[0]];
						}
						//Replace the promise in the cache with the resolved value
						cache[key] = value;
						resolve(value);
					} else {
						//If cancelled, ignore the returned value
						reject(CANCELLED);
					}
				});
			});
			//Allow the promise to be cancelled while still in flight.
			promise.cancel = () => {
				cancelled = true;
			};

			cache[key] = promise;
			return promise;
		}
		return result;
	};

	wrapped.invalidate = function() {
		for (const key of Object.keys(cache)) {
			const promise = cache[key];
			if (promise.cancel && typeof promise.cancel === 'function') {
				promise.cancel();
			}
		}
		notify(subscribers, INVALIDATED);
		cache = {};
	};

	wrapped.validate = function() {
		notify(subscribers, VALID);
	};
	// /**
	//  * Invalidate the cache, but make sure to run the supplied
	//  * function before the wrapped function is run to repopulate the cache.
	//  * @param {*} fn
	//  */
	// wrapped.runAndInvalidate = function(fn) {
	// 	before = fn;
	// 	wrapped.invalidate();
	// };
	wrapped.subscribe = function(fn) {
		subscribers.add(fn);
	};
	wrapped.unsubscribe = function(fn) {
		if (subscribers.has(fn)) {
			subscribers.delete(fn);
		}
	};

	wrapped.subscribers = () => subscribers;
	return wrapped;
}
