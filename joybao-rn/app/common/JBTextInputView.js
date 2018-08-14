import React, { Component } from 'react';
import {
	Text,
	View,
	TextInput,
	StyleSheet
} from 'react-native';
import { constant } from '../constant';

export default class JBTextInputView extends Component {
	render() {
		return(
			<View style={styles.viewStyle}>
				<Text style={styles.titleStyle}>{this.props.title}</Text>
				<TextInput
					style={styles.inputStyle}
					value={this.props.value}
					placeholder={this.props.placeholder}
					onChangeText={this.props.onChangeText}
					maxLength={this.props.maxLength}
					keyboardType={this.props.keyboardType}
					secureTextEntry={this.props.secureTextEntry}
					autoCorrect={false}/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	viewStyle: {
		backgroundColor: 'white',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems:'center',
		height: 50,
		marginTop: 0.5
	},
	titleStyle: {
		color: constant.kTitleColor, fontSize: 16, marginLeft: 15
	},
	inputStyle: {
		flex: 1,
		textAlign: 'right',
		color: constant.kTitleColor,
		fontSize: 16,
		marginRight:15
	}
});


