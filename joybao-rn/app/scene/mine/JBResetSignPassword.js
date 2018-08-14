import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { constant } from '../../constant';
import { SeparatorView, TextInputView, BottomButton } from '../../common';

export default class JBResetSignPassword extends Component {
	static navigationOptions = {
		title: '重置密码'
	};

	constructor(props) {
		super(props);

		this.state = {
			timeInterval: 60,//倒计时时间  60s
			fetchCodeTxt: '获取验证码',
			fetchCodeBtnDisabled: false,//获取验证码按钮状态
			finishBtnDisabled: false,//完成按钮状态
			validateCode: '',
			signPassword: ''
		}
	};

	componentWillUnmount() {//组件销毁，移除倒计时
		this.timer && clearInterval(this.timer);
	};

	//获取验证码倒计时
	_fetchValidateCode = () => {
		this.setState({
			fetchCodeBtnDisabled: true
		});
		this.timer = setInterval(() => {
			let totalTime = this.state.timeInterval;
			this.setState({
				timeInterval: totalTime - 1
			});
			if (this.state.timeInterval > 0) {
				this.setState({
					fetchCodeTxt: this.state.timeInterval + 's后重试'
				})
			} else {
				this.setState({
					fetchCodeTxt: '获取验证码',
					fetchCodeBtnDisabled: false,
					timeInterval: 60
				});
				clearInterval(this.timer);
			}
		}, 1000);
	};

	//验证码改变回调
	_onValidateCodeChanged = (newValue) => {
		this.setState({
			validateCode: newValue
		});
	};

	//签署密码改变回调
	_onSignPasswordChanged = (newValue) => {
		this.setState({
			signPassword: newValue
		});
	};

	//完成按钮点击事件
	_finishBtnClick = () => {
		if (this.state.validateCode.length === 0) {
			alert('请输入验证码');
		} else if (this.state.signPassword.length === 0) {
			alert('请输入签署密码');
		} else {
			this.props.navigation.goBack();
		}
	};

	//手机号码一栏UI
	_phoneNumberView = () => {
		return(
				<View style={styles.viewStyle}>
					<Text style={styles.titleStyle}>手机号码</Text>
					<View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
						<Text style={{color: constant.kSubTitleColor, marginRight: 5, textAlign: 'right', fontSize: 15}}>15267108334</Text>
						<View style={{backgroundColor: constant.kBgColor, width: 1, height: 35}}/>
						<TouchableOpacity
							style={{width: 100}}
							onPress={this._fetchValidateCode}
							disabled={this.state.fetchCodeBtnDisabled}>
							<Text style={styles.fetchCodeTxtStyle}>{this.state.fetchCodeTxt}</Text>
						</TouchableOpacity>
					</View>
				</View>
		)
	};

	render() {
		return(
			<ScrollView style={{backgroundColor: constant.kBgColor}}>
				<SeparatorView/>

				{this._phoneNumberView()}

				<TextInputView
					title="验证码"
					placeholder="请输入验证码"
					keyboardType="number-pad"
					value={this.state.validateCode}
					onChangeText={this._onValidateCodeChanged}/>

				<SeparatorView/>

				<TextInputView
					title="签署密码"
					placeholder="请设置一个密码"
					value={this.state.signPassword}
					onChangeText={this._onSignPasswordChanged}/>

				<BottomButton
					disabled={this.state.finishBtnDisabled}
					title="完成"
					bgColor="green"
					onPress={this._finishBtnClick}/>
			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	viewStyle: {
		backgroundColor: 'white',
		flexDirection: 'row',
		alignItems:'center',
		justifyContent: 'space-between',
		height: 50
	},
	titleStyle: {
		color: constant.kTitleColor, fontSize: 16, marginLeft: 15
	},
	fetchCodeTxtStyle: {
		color: constant.kTitleColor, fontSize: 16, textAlign: 'center'
	},
});