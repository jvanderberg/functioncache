import React, { PureComponent } from 'react';
import { PENDING, INVALIDATED } from './memoize';

export class PlaceHolder extends PureComponent {
	constructor(props) {
		super(props);
		this.state = { waiting: false, invalidated: false };
		this.functions = new Set();
		this.eventHandler = event => this.handleEvent(event);
	}
	refresh(waiting, invalidated = false) {
		this.setState({ waiting, invalidated });
	}
	componentWillUnmount() {
		for (const fn of this.functions) {
			fn.unsubscribe(this.eventHandler);
		}
		this.functions.clear();
	}
	handleEvent(event) {
		if (event === INVALIDATED) {
			this.refresh(false, true);
		} else if (event === PENDING) {
			this.refresh(true, true);
		}
	}

	/**
	 * Subscribe to the give function cache
	 * @param {Function} fn
	 */
	subscribe(fn, defaultValue = []) {
		fn.subscribe(this.eventHandler);
		if (!this.functions.has(fn)) {
			this.functions.add(fn);
		}
		const that = this;
		return function(...args) {
			const result = fn.apply(null, args);
			if (result.then && typeof result.then === 'function') {
				setTimeout(
					function() {
						this.refresh(true, true);
					}.bind(that),
					0
				);
				result
					.then(
						function() {
							this.refresh(false, false);
						}.bind(that)
					)
					.catch(
						function() {
							this.refresh(true, true);
						}.bind(that)
					);
				return defaultValue;
			}
			return result;
		};
	}
	render() {
		const Alternate = this.props.alternate;
		if (!this.state.waiting || !this.props.alternate) {
			const children = React.Children.map(this.props.children, (child, index) =>
				React.cloneElement(child, { subscribe: fn => this.subscribe(fn) })
			);
			//return <Content {...this.props} />;
			return children;
		} else if (this.state.waiting && this.props.alternate) {
			return <Alternate />;
		} else {
			debugger;
			return <div />;
		}
	}
}
