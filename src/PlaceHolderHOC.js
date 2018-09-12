import React from 'react';
import { PlaceHolder } from './PlaceHolder';

export const PlaceHolderHOC = ({ alternate }) => Component => {
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
