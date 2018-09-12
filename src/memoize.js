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
 * @param {boolean} immutable Whether or not the cache is immutable, if true, cannot be invalidated or evicted
 * Good for a 'one shot' cache for a single item.
 * @returns Either the cached results or throws the promise returned by the
 * function call
 */
export function memoize(fn, maxEntries = 1, immutable = false) {
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
						if (!immutable && entries.length === maxEntries + 1) {
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
		if (!immutable) {
			for (const key of Object.keys(cache)) {
				const promise = cache[key];
				if (promise.cancel && typeof promise.cancel === 'function') {
					promise.cancel();
				}
			}
			notify(subscribers, INVALIDATED);
			cache = {};
		}
	};

	wrapped.subscribe = function(fn) {
		if (!immutable) {
			subscribers.add(fn);
			return true;
		}
		return false;
	};

	wrapped.unsubscribe = function(fn) {
		if (subscribers.has(fn)) {
			subscribers.delete(fn);
		}
	};

	wrapped.subscribers = () => subscribers;
	return wrapped;
}
