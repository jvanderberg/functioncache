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
	let invalidatedResolve;
	let invalidatedReject;
	let invalidated = false;

	const wrapped = function(...args) {
		const key = JSON.stringify(args);
		if (cache[key]) {
			return cache[key];
		}
		const result = cached.apply(null, args);
		cache[key] = result;
		if (result.then && typeof result.then === 'function') {
			const promise = result.then(function(value) {
				const entries = Object.keys(cache).length;
				if (entries === maxEntries) {
					delete cache[entries[0]];
				}
				cache[key] = value;
			});

			if (invalidatedReject && !invalidated) {
				//Clean up old invalidation promise
				invalidatedReject();
			}
			promise.invalidated = new Promise((resolve, reject) => {
				invalidatedResolve = resolve;
				invalidatedReject = reject;
			});
			invalidated = false;
			throw result;
		}
		return result;
	};
	wrapped.invalidate = function() {
		cache = {};
		invalidated = false;
		invalidatedResolve();
	};
	return wrapped;
}
