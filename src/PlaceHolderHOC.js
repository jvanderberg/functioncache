import React, { PureComponent, Fragment } from 'react';
import { CANCELLED } from './memoize';

export const PlaceHolder = ({ alternate }) => Component => {
	class Wrapper extends PlaceHolder {
		constructor(props) {
			super(props);
		}
		render() {
			const Alternate = alternate;
			if (!this.state.waiting) {
				return <Component {...this.props} subscribe={(fn, defaultValue) => this.subscribe(fn, defaultValue)} />;
			} else if (this.state.waiting && alternate) {
				return <Alternate />;
			} else {
				return <div />;
			}
		}
	}
	return Wrapper;
};
