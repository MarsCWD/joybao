import React, { Component } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { constant } from '../../constant';
import { BottomButton, Picker, DatePicker } from '../../common';

export default class JBSignInfoFillIn extends Component{
	constructor(props) {
		super(props);

		this.state = {
			deadlineTime: '',
			payMoneyTime: '',
			dutyMan: '陈卫东',
			dutyManModalVisible: false,
			dutyManData: ['陈卫东', 'aaa'],
			selectedValue: ''
		}
	}

	infoSelectView = (title, subTitle, onPress) => {
		return(
			<TouchableOpacity style={styles.bgViewStyle} onPress={onPress}>
				<Text style={styles.titleStyle}>{title}</Text>
				<View style={{flexDirection: 'row', justifyContent:'flex-end', alignItems: 'center'}}>
					<Text style={styles.subTitleStyle} numberOfLines={2}>{subTitle}</Text>
					<Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
				</View>
			</TouchableOpacity>
		)
	};

	//签约截止日期点击
	_deadlineClick = () => {
		this.deadLinePicker._changeModalState(true);
	};

	//存款期限点击
	_payMoneyTimeClick = () => {
		this.payMoneyPicker._changeModalState(true);
	};

	//责任人点击
	_dutyManClick = () => {
		this.setState({
			selectedValue: this.state.dutyMan,
			dutyManModalVisible: true
		})
	};

	_onDeadlinePickerConfirm = (selectValue) => {
		this.setState({
			deadlineTime: selectValue
		});
		this.deadLinePicker._changeModalState(false);
	};

	_onPayMoneyPickerConfirm = (selectValue) => {
		this.setState({
			payMoneyTime: selectValue
		});
		this.payMoneyPicker._changeModalState(false);
	};

	_onDatePickerCancel = () => {
		this.deadLinePicker._changeModalState(false);
		this.payMoneyPicker._changeModalState(false);
	};

	_onPickerConfirm = (selectValue) => {
		this.setState({
			dutyMan: selectValue,
			dutyManModalVisible: false
		});
	};

	_onPickerCancel = () => {
		this.setState({
			dutyManModalVisible: false
		})
	};

	//下一步按钮点击
	_nextStepPress = () => {
		const { navigate } = this.props.navigation;
		navigate('SignPassword');
	};

	render() {
		return(
			<View style={{backgroundColor: constant.kBgColor, flex: 1}}>
				<Picker
					data={this.state.dutyManData}
					visible={this.state.dutyManModalVisible}
					selectedValue={this.state.selectedValue}
					onPickerConfirm={this._onPickerConfirm}
					onPickerCancel={this._onPickerCancel}/>

				<DatePicker
					ref={(e) => this.deadLinePicker = e}
					selectedDate={this.state.deadlineTime}
					onPickerConfirm={this._onDeadlinePickerConfirm}
					onPickerCancel={this._onDatePickerCancel}/>

				<DatePicker
					ref={(e) => this.payMoneyPicker = e}
				  selectedDate={this.state.payMoneyTime}
				  onPickerConfirm={this._onPayMoneyPickerConfirm}
				  onPickerCancel={this._onDatePickerCancel}/>

				<ScrollView
					style={{backgroundColor: constant.kBgColor}}
					contentContainerStyle={{marginTop: 15}}>
					<View>
						{this.infoSelectView('签约截止日期', this.state.deadlineTime, this._deadlineClick)}
						{this.infoSelectView('付款期限', this.state.payMoneyTime, this._payMoneyTimeClick)}
						<View style={{height: 15, backgroundColor: constant.kBgColor}}/>
						{this.infoSelectView('责任人(发送签约提醒)', this.state.dutyMan, this._dutyManClick)}
					</View>
					<BottomButton bgColor="#FF8084" onPress={this._nextStepPress} title='下一步'/>
				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	bgViewStyle: {
		backgroundColor: 'white',
		marginTop: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 50
	},
	titleStyle: {
		color: constant.kTitleColor, fontSize: 16, marginLeft: 15
	},
	subTitleStyle: {
		fontSize: 16,
		color: constant.kSubTitleColor,
		marginRight: 15,
		textAlign: 'right',
		width: 150
	},
	arrowStyle: {
		width: 24,
		height: 24,
		marginRight: 15
	}
});