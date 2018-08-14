import React, { Component } from 'react';
import {
	ListView, View, Text, TextInput, StyleSheet
} from 'react-native';
import { constant } from '../../constant';
import { TextInputView, SectionHeader, BottomButton}  from '../../common';

export default class JBAddReceiver extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: new ListView.DataSource({
				rowHasChanged:(r1, r2) => r1 !== r2
			}),
			data: [],
			phoneNumber: '',
			personName: '',
			sureButtonDisabled: true
		}
	}

	//action
	_onChangeText = (text) => {
		this.setState({
			phoneNumber: text
		})
	};

	_renderHeader = () => {
		return(
			<View style={{marginTop: 15}}>
				<TextInputView
					title="手机号码"
					placeholder="请输入手机号码"
					value={this.state.phoneNumber}
					onChangeText={this._onChangeText}
					maxLength={11}
					keyboardType='number-pad'/>
				<View style={styles.headerViewStyle}>
					<Text style={styles.headerTitleStyle}>姓 名</Text>
					<Text style={styles.textInputStyle} value={this.state.personName}/>
				</View>
				<SectionHeader title='点击选择历史用户'/>
			</View>
		)
	};

	_renderFooter = () => {
		return(
			<BottomButton
				bgColor="#539EDA"
				title="确定"
				disabled={this.state.sureButtonDisabled}
			/>
		)
	};

	_renderRow = () => {
		return(
			<View/>
		)
	};

	render() {
		return(
			<ListView
				style={{backgroundColor: '#F6F6F6'}}
				removeClippedSubviews={false}
				enableEmptySections={true}
				dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
				renderRow={this._renderRow}
				renderHeader={this._renderHeader}
				renderFooter={this._renderFooter}/>
		)
	}
}

const styles = StyleSheet.create({
	headerViewStyle: {
		backgroundColor: 'white',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems:'center',
		height: 50,
		marginTop: 0.5
	},
	headerTitleStyle: {
		color: constant.kTitleColor, fontSize: 16, marginLeft: 15
	},
	textInputStyle: {
		flex: 1, textAlign: 'right', color: constant.kTitleColor, fontSize: 16, marginRight:15
	}
});