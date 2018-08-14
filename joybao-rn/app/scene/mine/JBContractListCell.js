import React, { Component } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { constant } from '../../constant';

export default class JBContractListCell extends Component {
	render() {
		let { item } = this.props;
		return(
			<TouchableOpacity style={{marginTop:1, backgroundColor:'white', height:65, justifyContent:'center'}}>
				<View style={{flexDirection:'row'}}>
					<Image style={styles.rowAvatarStyle} source={item.avatar}/>

					<View style={{flexDirection:'column', justifyContent:'space-between', flex: 1}}>
						<View style={{flexDirection:'row', justifyContent:'space-between'}}>
							<Text style={styles.rowTitleStyle} numberOfLines={1}>{item.title}</Text>
							<Text style={styles.rowStatusStyle}>{item.status}</Text>
						</View>
						<View style={{flexDirection:'row', justifyContent:'space-between'}}>
							<Text style={styles.rowSubTitleStyle}>{item.subTitle}</Text>
							<Text style={styles.rowStatusStyle}>{item.time}</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
}

const styles = StyleSheet.create({
	rowAvatarStyle: {
		width: 45, height: 45, marginLeft: 15
	},
	rowTitleStyle: {
		color: constant.kTitleColor, fontSize: 16, marginLeft: 15, width: 220
	},
	rowSubTitleStyle: {
		color: constant.kSubTitleColor, fontSize: 12, marginLeft: 15
	},
	rowStatusStyle: {
		color: constant.kSubTitleColor, fontSize: 12, textAlign: 'right', marginRight: 15
	}
});