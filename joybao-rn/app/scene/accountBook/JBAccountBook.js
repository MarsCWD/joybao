import React, { Component } from 'react';
import {
	StyleSheet,
	// StatusBar,
	ListView,
	TouchableOpacity,
	TouchableHighlight,
	View,
	Image,
	Text
} from 'react-native';
import { constant } from '../../constant';

// const {ScreenWidth, ScreenHeight} = Dimensions.get('window');

export default class AccountBook extends Component {
	//构造函数
	constructor(props) {
		super(props);
		//
		this.state = {
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
			data: [
				{
					avatar: require('../../images/jb_avatar.png'),
					title: '绍兴白鲸信息技术有限公司',
					subTitle: '2017062615',
					status: '未生效',
					time: '2017-06-26 15:13' },
				{
					avatar: require('../../images/jb_avatar.png'),
					title: '陈卫东',
					subTitle: '2017062111',
					status: '未生效',
					time: '2017-06-21 15:52' }
			]
		}
	};

	//快捷签约按钮点击
	_signQuickPress = () => {
		this.setState({
			selectedTab: 1
		})
	};

	_renderHeader = () => {
		return (
			<View style={{height: 260}}>
				<TouchableOpacity style={{height:180}}
					onPress={this._signQuickPress}>
					<Image
						style={{backgroundColor:constant.kNavBgColor, height: 180,
						flexDirection:'row', justifyContent:'space-between', flex: 1}}>
						<View style={{flex: 1, justifyContent: 'space-between', marginBottom:18, marginTop:66}}>
							<Text style={styles.enterAccountStyle}>本月出账</Text>
							<Text style={{marginLeft: 15, color: 'white', fontSize: 34}}>0.00</Text>
							<Text style={styles.enterAccountStyle}>本月入账：0.00</Text>
						</View>
						<View style={{justifyContent:'flex-end'}}>
							<Text style={styles.budgetStyle}>本月预算剩：4500.00</Text>
						</View>
					</Image>
				</TouchableOpacity>
				<View style={{backgroundColor: 'white', flex: 1}}>
					<TouchableHighlight style={styles.signQuickStyle}>
						<View style={{flexDirection:'row', justifyContent:'space-between'}}>
							<View style={{justifyContent: 'center', flex: 1}}>
								<Text style={{fontSize: 18, color: 'white', textAlign:'center'}}>快捷签约</Text>
							</View>
							<View style={styles.signQuickIconStyle}>
								<Image source={require('../../images/jb_sign_quick.png')} style={{width: 30, height: 30}}/>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			</View>
		)
	};

	_renderRow = (rowData) => {
		return(
			<TouchableOpacity style={{marginTop:1, backgroundColor:'white', height:65, justifyContent:'center'}}>
				<View style={{flexDirection:'row'}}>
					<Image style={styles.rowAvatarStyle} source={rowData.avatar}/>
					
					<View style={{flexDirection:'column', justifyContent:'space-between', flex: 1}}>
						<View style={{flexDirection:'row', justifyContent:'space-between'}}>
							<Text style={styles.rowTitleStyle} numberOfLines={1}>{rowData.title}</Text>
							<Text style={styles.rowStatusStyle}>{rowData.status}</Text>
						</View>
						<View style={{flexDirection:'row', justifyContent:'space-between'}}>
							<Text style={styles.rowSubTitleStyle}>{rowData.subTitle}</Text>
							<Text style={styles.rowStatusStyle}>{rowData.time}</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		)
	};


	render() {
		return (
			<ListView
				enableEmptySections={false}
				removeClippedSubviews={false}
				style={{backgroundColor: '#F6F6F6'}}
				dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
				renderRow={this._renderRow}
				renderHeader={this._renderHeader} />
		);
	}
}

const styles = StyleSheet.create({
	enterAccountStyle: {//本月出账、本月入账
		marginLeft: 15, color: 'white', fontSize: 16
	},
	budgetStyle: {//预算
		marginBottom: 18, marginRight: 15, color: 'white', fontSize: 16
	},
	signQuickStyle: {//快捷签约按钮
		margin: 15, backgroundColor: constant.kNavBgColor, borderRadius: 5, flex: 1
	},
	signQuickIconStyle: {//快捷签约右侧图标背景
		width: 55, height: 55, backgroundColor: '#FFFFFF33', justifyContent:'center', alignItems: 'center'
	},
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
