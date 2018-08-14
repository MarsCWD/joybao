import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	ListView,
	Image,
	Text,
	TouchableOpacity,
	TouchableHighlight
} from 'react-native';

//外部文件
import { constant } from '../../constant';
import { SeparatorView } from '../../common';

export default class Mine extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2,
				sectionHeaderHasChanged: (s1, s2) => s1 !== s2
			}),
			data: {
				'1': [{leftImageName: require('../../images/jb_mine_signature.png'), title: "我的签名"}],
				'2': [{leftImageName: require('../../images/jb_done_contract.png'), title: "已生效"},
					{leftImageName: require('../../images/jb_wait_other_contract.png'), title: "待我签署"},
					{leftImageName: require('../../images/jb_wait_contract.png'), title: "待他人签署"}],
				'3': [{leftImageName: require('../../images/jb_mine_service.png'), title: "剩余签署次数"},
					{leftImageName: require('../../images/jb_mine_signature.png'), title: "马上充值"}],
				'4': [{leftImageName: require('../../images/jb_mine_service.png'), title: "法律服务"}]
			},
			effectCount: 10,//已生效合同数量
			waitMeSignCount: 110,//待我签署合同数量
			waitOtherSignCount: 0,//待他人签署合同数量
			signedNumber: 0//签署次数
		}
	};

	//头像点击事件
	_tapAvatar = () => {
		const { navigate } = this.props.navigation;
		navigate('PersonalInfo');
	};

	_onPress = (sectionId, rowId) => {
		const { navigate } = this.props.navigation;
		if (sectionId === 1 && rowId === 0) {
			navigate('MySignature');
		} else if (sectionId === 2) {
			let title = '';
			if (rowId === 0) title = '已签署合约';
			else if (rowId === 1) title = '待我签署合约';
			else title = '待他人签署合约';

			navigate('ContractList', {title: title});
		}
	};

	//listView的section渲染
	_renderSectionHeader = () => {
		return (
			<SeparatorView/>
		)
	};

	//listView 行渲染
	_renderRow = (rowData, sectionID, rowID) => {
		let rightView = null;
		if (parseInt(sectionID) === 2) {
			if ((this.state.effectCount === 0 && parseInt(rowID) === 0) ||
				(this.state.waitMeSignCount === 0 && parseInt(rowID) === 1) ||
				(this.state.waitOtherSignCount === 0 && parseInt(rowID) === 2)) {
				rightView = <Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
			} else {
				rightView =
					<View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
						<View style={styles.toastStyle}>
							<Text style={{fontSize: 16, textAlign: 'center', color: 'white'}}>
								{parseInt(rowID) === 0 ? (this.state.effectCount > 99 ? '99+' : this.state.effectCount) :
									(parseInt(rowID) === 1 ? (this.state.waitMeSignCount > 99 ? '99+' : this.state.waitMeSignCount) :
										(this.state.waitOtherSignCount > 99 ? '99+' : this.state.waitOtherSignCount))}
							</Text>
						</View>
						<Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
					</View>
			}
		} else if (parseInt(sectionID) === 3 && parseInt(rowID) === 0) {
			rightView =
				<Text style={styles.subTitleStyle}>{this.state.signedNumber + '次'}</Text>
		} else {
			rightView = <Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
		}

		return (
			<TouchableOpacity onPress={() => {this._onPress(parseInt(sectionID), parseInt(rowID))}}>
				<View style={styles.rowStyle}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<Image style={styles.leftImageStyle} source={rowData.leftImageName}/>
						<Text style={styles.rowTitleStyle}>{rowData.title}</Text>
					</View>
					{rightView}
				</View>
			</TouchableOpacity>
		)
	};

	//头部组件渲染
	_renderHeader = () => {
		return (
			<View style={{height: 180, backgroundColor: constant.kNavBgColor, alignItems: 'center'}}>
				<TouchableHighlight
					onPress={this._tapAvatar}
					underlayColor="#FFFFFF80"
					style={styles.avatarBorderStyle}>
					<Image style={styles.avatarStyle} source={require('../../images/jb_avatar.png')}/>
				</TouchableHighlight>
				<View style={{flexDirection:'row', alignItems:'flex-end', marginTop: 10, height: 18}}>
					<Text style={styles.nameStyle}>绍兴白鲸信息技术有限公司</Text>
					<Text style={{fontSize: 12, color: 'white', height: 12}}>  代理人</Text>
				</View>
				<View style={styles.statusBgStyle}>
					<Text style={styles.statusStyle}>实名认证中</Text>
				</View>
			</View>
		)
	};

	render() {
		return (
			<ListView
				removeClippedSubviews={false}
				style={{backgroundColor: '#F6F6F6'}}
				dataSource={this.state.dataSource.cloneWithRowsAndSections(this.state.data)}
				renderRow={this._renderRow}
				renderSectionHeader={this._renderSectionHeader}
				renderHeader={this._renderHeader}/>
		);
	}
}

const styles = StyleSheet.create({
	avatarBorderStyle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginTop: 10,
		backgroundColor: '#FFFFFF80',
		justifyContent: 'center'
	},
	avatarStyle: {
		width: 70,
		height: 70,
		borderRadius: 35,
		margin: 5
	},
	nameStyle: {
		color: 'white',
		fontSize: 18,
		height: 18,
	},
	statusBgStyle: {
		height: 18,
		width: 80,
		marginTop: 10,
		borderRadius: 2,
		backgroundColor: '#5CC2F2',
		alignItems: 'center',
		justifyContent: 'center'
	},
	statusStyle: {
		color: 'white',
		fontSize: 14,
		height: 14,
	},
	rowStyle: {
		flex: 1,
		height: 50,
		backgroundColor: 'white',
		flexDirection:'row',
		marginTop: 1,
		justifyContent:'space-between',
		alignItems: 'center'
	},
	toastStyle: {
		marginRight: 20,
		borderRadius: 10,
		width: 50,
		height: 25,
		backgroundColor: '#FFD700',
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center'
	},
	subTitleStyle: {
		textAlign: 'right',
		color: constant.kSubTitleColor,
		marginRight: 15,
		fontSize: 16
	},
	leftImageStyle: {
		width: 30,
		height: 30,
		marginLeft: 15,
	},
	rowTitleStyle: {
		width: 150,
		height: 20,
		marginLeft: 15,
		fontSize: 16,
		color: constant.kTitleColor,
	},
	arrowStyle: {
		width: 20,
		height: 20,
		marginRight: 15,
	}
});