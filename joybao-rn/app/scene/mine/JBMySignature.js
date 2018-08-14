import React, { Component } from 'react';
import { TouchableHighlight, Text, NativeModules } from 'react-native';

let OCRRecognizeManager = NativeModules.OCRRecognizeManager;

export default class JBMySignature extends Component {
	_onPress = () => {
		OCRRecognizeManager.showOCRViewWithType(1, (callback) => {
			alert(callback)
		})
	};

	render() {
		return (
			<TouchableHighlight onPress={this._onPress}>
				<Text>点我呀</Text>
			</TouchableHighlight>
		)
	}
}