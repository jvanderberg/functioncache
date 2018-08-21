let state = {};
let delay = 50;
let id = 0;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function getUniqueId() {
	return id++;
}

export function mockDB(initialState = {}, delay = 50) {
	state = initialState;
	delay = delay;
	id = 0;
	return state;
}

export async function get(id) {
	await wait(delay);
	if (typeof id === 'undefined') {
		return state;
	} else {
		return state[id];
	}
}

export async function put(value) {
	await wait(delay);
	let id = value.id;
	if (!id) {
		id = getUniqueId();
		value.id = id;
	}
	state[id] = value;
	return value;
}

export async function update(value) {
	await wait(delay);
	let id = value.id;
	if (id) {
		state[id] = { ...state[id], ...value };
		return value;
	}
}

export async function remove(value) {
	await wait(delay);
	if (value in state) {
		delete state[value];
		return true;
	} else {
		let id = value.id;
		if (typeof id !== 'undefined') {
			delete state[id];
			return true;
		}
	}
	return false;
}

export async function find(filter) {
	//Three times the delay, finding stuff is hard
	await wait(3 * delay);
	const result = [];
	const keys = Object.keys(state);
	for (const key of keys) {
		const val = state[key];
		const found = filter(val);
		if (found === true) {
			result.push(val);
		}
	}
	return result;
}
