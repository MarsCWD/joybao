import React, { Component } from 'react';
import { View } from 'react-native';

export default class JBSeparatorView extends Component {
	render() {
		return(
			<View style={{height: this.props.height ? this.props.height : 15}}/>
		)
	}
}