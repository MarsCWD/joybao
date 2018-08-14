import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { BottomButton, TextInputView } from '../../common';
import { constant } from '../../constant';

export default class JBSignPassword extends Component {
	constructor(props) {
		super(props);
		this.state = {
			signPassword: ''
		}
	};

	_onChangeText = (text) => {
		this.setState({
			signPassword: text
		})
	};

	_onPress = () => {

	};

	render() {
		return(
			<ScrollView
				style={{backgroundColor: constant.kBgColor}}
				contentContainerStyle={{marginTop: 15}}>
				<TextInputView
					title="签署密码"
					placeholder="请输入签署密码"
				  value={this.state.signPassword}
					onChangeText={this._onChangeText}
					secureTextEntry={true}/>

				<BottomButton
					bgColor='green'
					title="确 定"
					onPress={this._onPress}/>
			</ScrollView>
		)
	}
}