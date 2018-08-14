import React, { Component } from 'react';
import {
	Text,
	View,
	TouchableOpacity,
	StyleSheet
} from 'react-native';
import { constant } from '../constant';

export default class JBBottomButton extends Component {
	render() {
		return(
			<View style={{height: 100}}>
				<TouchableOpacity
					disabled={this.props.disabled}
					onPress={this.props.onPress}
					style={[styles.nextBtnStyle,
						{
							backgroundColor: this.props.disabled ? constant.kBgColor : this.props.bgColor,
							borderColor: this.props.disabled ? constant.kSubTitleColor : this.props.bgColor
						}]}>
					<Text style={{color: this.props.disabled ? constant.kSubTitleColor : 'white', fontSize: 18}}>{this.props.title}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	nextBtnStyle: {
		marginLeft: 15, marginTop: 25, marginRight: 15, height: 50,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 0.5
	}
});