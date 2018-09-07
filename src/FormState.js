import { PureComponent } from 'react';

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
