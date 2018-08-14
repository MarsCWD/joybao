import React, { Component } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-picker';

export default class JBDatePicker extends Component {
	constructor(props){
		super(props);

		this.state = {
			selectDate: '',
			visible: false
		}
	};

	_createDateData() {
		let date = [];
		for(let i=1950;i<2050;i++){
			let month = [];
			for(let j = 1;j<13;j++){
				let day = [];
				if(j === 2){
					for(let k=1;k<29;k++){
						day.push(k+'日');
					}
					//Leap day for years that are divisible by 4, such as 2000, 2004
					if(i%4 === 0){
						day.push(29+'日');
					}
				}
				else if(j in {1:1, 3:1, 5:1, 7:1, 8:1, 10:1, 12:1}){
					for(let k=1;k<32;k++){
						day.push(k+'日');
					}
				}
				else{
					for(let k=1;k<31;k++){
						day.push(k+'日');
					}
				}
				let _month = {};
				_month[j+'月'] = day;
				month.push(_month);
			}
			let _date = {};
			_date[i+'年'] = month;
			date.push(_date);
		}
		return date;
	}

	_today = () => {
		let today = new Date();
		let td = [];

		td.push(today.getFullYear());
		td.push(today.getMonth() + 1);
		td.push(today.getDate());

		return td;
	};

	_changeModalState = (visible) => {
		let { selectedDate, onPickerConfirm, onPickerCancel } = this.props;
		let selectValue;
		if (selectedDate.length === 0) {//如果当前没有选择日期
			selectValue = this._today();
			console.log(selectValue);
		} else {//日期转换 1970-01-01转成 [1970年, 1月, 1日]
			selectValue = selectedDate.split('-');
			if (selectValue[1].search(/0/) === 0) {//01变成1
				selectValue[1] = selectValue[1].slice(1);
			}
			if (selectValue[2].search(/0/) === 0) {
				selectValue[2] = selectValue[2].slice(1);
			}
		}
		selectValue[0] = selectValue[0] + '年';
		selectValue[1] = selectValue[1] + '月';
		selectValue[2] = selectValue[2] + '日';
		this.setState({
			selectDate: selectValue
		});

		DatePicker.init({
			pickerData: this._createDateData(),
			selectedValue: selectValue,
			pickerConfirmBtnText: '确定',
			pickerCancelBtnText: '取消',
			pickerTitleText: '',
			pickerConfirmBtnColor: [0, 255, 0, 1],
			pickerCancelBtnColor: [152, 152, 152, 1],
			pickerToolBarBg: [255, 255, 255, 1],
			pickerBg: [255, 255, 255, 1],
			pickerFontSize: 20,
			pickerToolBarFontSize: 16,
			onPickerConfirm: data => {
				if (parseInt(selectValue[0]) > parseInt(data[0]) ||
					(parseInt(selectValue[0]) === parseInt(data[0]) &&
					parseInt(selectValue[1]) > parseInt(data[1])) ||
					(parseInt(selectValue[0]) === parseInt(data[0]) &&
					parseInt(selectValue[1]) === parseInt(data[1]) &&
					parseInt(selectValue[2]) > parseInt(data[2]))) {
					alert('请选择大于等于今日的日期');
				} else {
					for (let index in data) {
						if (data.hasOwnProperty(index)) {
							if (data[index].length === 2) {
								data[index] = '0' + data[index];//拼接，若为7月，则显示07
							}
						}
					}
					data = data.join('-');
					data = data.replace(/年/, '');
					data = data.replace(/月/, '');
					data = data.replace(/日/, '');
					onPickerConfirm(data);
				}
			},
			onPickerCancel: data => {
				onPickerCancel();
			},
			onPickerSelect: data => {

			}
		});

		if (visible) {
			DatePicker.show();
		} else {
			DatePicker.hide();
		}
		this.setState({
			visible: visible
		})
	};


	render() {
		let { onPickerCancel } = this.props;

		return(
			<Modal
				animationType={'fade'}
				visible={this.state.visible}
				transparent={true}>
				<View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', flex: 1}}>
					<TouchableOpacity onPress={() => onPickerCancel()} style={{flex: 1}} activeOpacity={1}>
						<View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}/>
					</TouchableOpacity>
				</View>
			</Modal>
		)
	}
}