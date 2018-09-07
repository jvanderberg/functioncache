import React, { PureComponent, Fragment } from 'react';
import { CANCELLED } from './memoize';

export class FormState extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	static defaultProps = {
		name: 'value'
	};

	componentDidMount() {
		this.setState({ [`${this.props.name}Changed`]: e => this.onChange(e) });
	}

	onChange(value) {
		this.setState({ [this.props.name]: value });
	}

	render() {
		return this.props.children(this.state);
	}
}
