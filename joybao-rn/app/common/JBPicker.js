import React, { Component } from 'react';
import { Modal, View, Button, Picker, TouchableOpacity } from 'react-native';
import { constant } from '../constant';

export default class JBPicker extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectValue: this.props.selectValue
		}
	}

	_onPickerSelect = (newValue) => {
		this.setState({
			selectValue: newValue
		})
	};

	render() {
		let { data, visible, onPickerConfirm, onPickerCancel } = this.props;

		return(
			<Modal
				animationType={'fade'}
				visible={visible}
				transparent={true}>
				<View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', flex: 1}}>
					<TouchableOpacity onPress={() => onPickerCancel()} style={{flex: 1}} activeOpacity={1}>
						<View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}/>
					</TouchableOpacity>
					<View style={{backgroundColor: 'white', height: 250}}>
						<View style={{height: 40, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between'}}>
							<Button color={constant.kSubTitleColor} title="取消" onPress={() => onPickerCancel()}/>
							<Button color="green" title="确定" onPress={() => onPickerConfirm(this.state.selectValue)}/>
						</View>
						<View style={{backgroundColor: constant.kSubTitleColor, height: 0.5}}/>
						<Picker
							ref={(e) => {this.picker = e}}
							selectedValue={this.state.selectValue}
							onValueChange={this._onPickerSelect}>
							{data.map((item) => (
								<Picker.Item
									key={item}
								  value={item}
								  label={item}
								/>
							))}
						</Picker>
					</View>
				</View>
			</Modal>
		)
	}
}