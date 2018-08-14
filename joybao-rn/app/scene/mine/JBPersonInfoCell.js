import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { constant } from '../../constant';

export default class JBPersonInfoCell extends Component {
	render() {
		let rightView = null;
		if (this.props.avatar) {
			rightView =
				<Image
					source={this.props.avatar}
					style={{width: 40, height: 40, marginRight: 15, borderRadius: 20}}/>
		} else if (!this.props.showArrow) {
			rightView =
				<Text style={styles.rowSubTitleStyle}>{this.props.subTitle}</Text>
		} else {
			rightView =
				<View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
					<Text style={styles.rowSubTitleStyle}>{this.props.subTitle}</Text>
					<Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
				</View>
		}

		return(
			<TouchableOpacity onPress={this.props.onPress}>
				<View style={styles.rowStyle}>
					<Text style={styles.rowTitleStyle}>{this.props.title}</Text>
					{rightView}
				</View>
			</TouchableOpacity>
		)
	}
}

const styles = StyleSheet.create({
	rowStyle: {
		flex: 1,
		height: 50,
		backgroundColor: 'white',
		flexDirection:'row',
		marginTop: 1,
		justifyContent:'space-between',
		alignItems: 'center'
	},
	rowTitleStyle: {
		marginLeft: 15,
		fontSize: 16,
		color: constant.kTitleColor,
	},
	rowSubTitleStyle: {
		marginRight: 15,
		fontSize: 16,
		color: constant.kSubTitleColor,
		textAlign: 'right'
	},
	arrowStyle: {
		width: 20,
		height: 20,
		marginRight: 15
	}
});