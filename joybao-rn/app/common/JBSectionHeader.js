import React, { Component } from 'react';
import {
	Text,
	View
} from 'react-native';
import { constant } from '../constant';

export default class JBSectionHeader extends Component {
	render() {
		return(
			<View style={{height: 40, justifyContent: 'center'}}>
				<Text style={{fontSize: 16, color:constant.kSubTitleColor, marginLeft: 15}}>
					{this.props.title}
				</Text>
			</View>
		)
	}
}