import React, { PureComponent, Fragment } from 'react';
import { CANCELLED } from './memoize';

export const PlaceHolder = ({ alternate }) => Component => {
	class Wrapper extends PureComponent {
		constructor(props) {
			super(props);
			this.state = { waiting: false, invalidated: false };
		}
		refresh(waiting, invalidated = false) {
			this.setState({ waiting, invalidated });
		}

		componentDidCatch(error) {
			if (error.then && typeof error.then === 'function') {
				error
					.then(value => {
						this.refresh(false);
						//Hook the invalidated promise attached to the original promise
						if (
							error.invalidated &&
							error.invalidated.then &&
							typeof error.invalidated.then === 'function'
						) {
							error.invalidated.then(() => {
								this.refresh(false, true);
							});
						}
					})
					.catch(e => {
						this.refresh(false, true);
					});
			}
			this.refresh(true);
		}
		render() {
			const Alternate = alternate;
			if (!this.state.waiting) {
				//const children = React.Children.map(this.props.children, (child, index) => React.cloneElement(child));
				return <Component {...this.props} />;
			} else if (this.state.waiting && alternate) {
				return <Alternate />;
			} else {
				return <div />;
			}
		}
	}
	return Wrapper;
};
