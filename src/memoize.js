export const INVALIDATED = Symbol('INVALIDATE');
export const EXPIRED = Symbol('EXPIRED');
export const CANCELLED = Symbol('CANCELLED');
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
	let invalidatedPromise = {};

	const wrapped = function(...args) {
		const key = JSON.stringify(args);
		let result = cache[key];
		if (typeof result !== 'undefined') {
			if (result.then && typeof result.then === 'function') {
				//If the cached item is a Promise, re-throw it.
				throw result;
			} else {
				return result;
			}
		}
		result = fn.apply(null, args);

		if (result.then && typeof result.then === 'function') {
			let cancelled = false;
			const promise = new Promise((resolve, reject) => {
				result.then(function(value) {
					if (!cancelled) {
						const entries = Object.keys(cache);
						if (entries.length === maxEntries + 1) {
							delete cache[entries[0]];
							const rejectInvalidationKey = invalidatedPromise[entries[0]].reject;

							if (rejectInvalidationKey) {
								//The cache entry has not been explicitly invalidated, but if a view refreshes
								//it will cause a refetch, and re-subscription to the invalidation promise.  This rejection
								//will clear out any existing subscriptions to the invalidation promise for this key.
								rejectInvalidationKey(EXPIRED);
								delete invalidatedPromise[entries[0]];
							}
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
			promise.invalidated = new Promise((resolve, reject) => {
				invalidatedPromise[key] = { resolve, reject };
			});
			cache[key] = promise;
			throw promise;
		}
		return result;
	};

	wrapped.invalidate = function() {
		for (const key of Object.keys(cache)) {
			const promise = cache[key];
			if (promise.cancel && typeof promise.cancel === 'function') {
				promise.cancel(INVALIDATED);
			}
		}
		for (const key of Object.keys(invalidatedPromise)) {
			invalidatedPromise[key].resolve(INVALIDATED);
		}
		invalidatedPromise = {};
		cache = {};
	};

	return wrapped;
}
