## Memozing function cache React demo

A demo of using a memoizing HOF (higher order function) as the source of persistent state in a React application.

memoize.js contains the 'memoize' function, which wraps another function and creates a cache based on the arguments passed to the function. The wrapper is also augmented with function properties that can be used to invalidate the cache, and subscribe to invalidation events.

The PlaceHolder component follows the 'render props' pattern to provide a wrapper that injects a 'subscribe' function that allows your components to handle the Promise that memoize will return if the underlying logic is async. The PlaceHolder component will show alternate content while the async logic is pending, and refresh the component when the aysnc logic resolves and the function cache is populated.

## Using 'memoize'

```jsx
const url = 'http://exampleapi.com/something';

async function fetchSomeStuff(id) {
	const stuff = await fetch(`${url}?${id}`);
	const data = await stuff.json();
	return data;
}

const fetcher = memoize(fetchSomeStuff, 3); //Store up to three results

const Data = ({ data }) => {
	return <div>JSON.stringify(data)</div>;
};
const Alternate = <div>Please wait...</div>;

const Main = ({ id }) => {
	<PlaceHolder alternate={Alternate}>
		{({ subscribe }) => {
			//subscribe to the result, returning a default value of ''
			//and call the function
			const result = subscribe(fetcher, '')(id);
			return <Data data={result} />;
		}}
	</PlaceHolder>;
};
```

## The Demo

The Demo is a CRA based application. Look in App.js for the primary logic. It's a simple TODO application with a search/filter, delete, and add functionality.

It instantiates multiple copies of the base todo list in order to demonstrate how the function cache can be shared, and how global invalidation events and updates propagate to all subscribers.

The datastore is 'mockDB', a simple in memory database with a built in async delay. This allows us to similate remote async services without a dependency.

### service.js

service.js instantiates a simple mockDB with a fixed async delay and exports functions that allow the consumer to add, delete and search for todo items. The 'search' and 'get' functions are wrapped in the 'memoize' wrapper before export.

'deleteItem' and 'addItem' both invalidate the cache as they update the underlying store.

### Code splitting and dynamic component loading

Note that service.js also contains the following code:

```javascript
async function getTodoList() {
	const List = await import('./List');
	return List.TodoList;
}

export const getTodoListComponent = memoize(getTodoList, 1);
```

The dynamic import statement 'import()' is async. In the context of a webpack build this will result in the code for the 'List' component being put into a separate bundle.

Here we memoize that async logic, and you can look in App.js to see how a component can use this to dynamically load children.
