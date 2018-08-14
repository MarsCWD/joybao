import React, { Component } from 'react';
import {
	ListView,
	Text,
	View,
	TouchableOpacity,
	StyleSheet,
	Image,
	StatusBar
} from 'react-native';
import { constant, format } from '../../constant';
import ImageListView from './JBSignImageListView';
import ReceiverMineView from './JBSignReceiverMineView';
import { SectionHeader, BottomButton, TextInputView } from '../../common';

//第三方
import ImagePicker from 'react-native-image-picker';

const options = {// 弹出框配置
	title:'请选择',
	cancelButtonTitle:'取消',
	takePhotoButtonTitle:'相机',
	chooseFromLibraryButtonTitle:'相册',
	quality:0.75,
	allowsEditing:true,
	noData:false,
	storageOptions: {
		skipBackup: true,
		path:'images'
	}
};

export default class Sign extends Component {
	constructor(props) {
		super(props);

		this.state = {
			contractName: format(new Date(), 'yyyyMMddhh'),//合约名称
			imageLists: [
				{ image: require('../../images/jb_quick_sign.jpg') },
				{ image: require('../../images/jb_sign_add_statements.png') }
			],

			dataSource: new ListView.DataSource({
				rowHasChanged:(r1, r2) => r1 !== r2
			}),
			data: []
		}
	}

	//action
	_nextStepPress = () => {
		// if (this.state.data.length < 2) {
		// 	alert('必须有2个及以上收件方(签署)');
		// 	return;
		// }
		// let images = this.state.imageLists;
		// if (images.length > 2) {
		// 	images = images.splice(0, 1);
		// 	images = images.splice(images.length - 1, 1);
		// }
		// if (images.length < 1) {
		// 	alert('请上传码单/对账单');
		// 	return;
		// }

		const { navigate } = this.props.navigation;
		navigate('InfoFillIn');
	};

	_addReceiver = () => {
		const { navigate } = this.props.navigation;
		navigate('AddReceiver');
	};

	_addStatements = () => {
		StatusBar.setBarStyle('default');
		ImagePicker.showImagePicker(options,(res) => {
			StatusBar.setBarStyle('light-content');
			if (res.didCancel) {  // 返回
			} else {
				let source = {uri: res.uri};  // 保存选中的图片

				let images = this.state.imageLists;
				images.splice(images.length - 1, 0, {image: source});
				this.setState({
					imageLists: images
				});
			}
		})
	};

	_deleteImage = (index) => {
		let images = this.state.imageLists;
		images.splice(index, 1);//删除对应索引的内容
		this.setState({
			imageLists: images
		});
	};

	//合同名称修改
	_onChangeText = (text) => {
		this.setState({
			contractName: text
		})
	};

	_renderRow = () => {
		return(
			<View/>
		)
	};

	_renderHeader = () => {
		return(
			<View style={{marginTop: 15}}>
				<TextInputView
					title="合同名称"
					value={this.state.contractName}
					placeholder='请输入合同名称'
					onChangeText={this._onChangeText}/>

				<SectionHeader title='签署方式(长按查看示例'/>

				<ImageListView
					data={this.state.imageLists}
					addStatements={this._addStatements}
					deleteImage={this._deleteImage}/>

				<SectionHeader title='接收方'/>

				<ReceiverMineView />
			</View>
		)
	};

	_renderFooter = () => {
		return(
			<View>
				<TouchableOpacity//添加接收方
					onPress={this._addReceiver}>
					<View style={styles.rowStyle}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Image style={styles.leftImageStyle} source={require('../../images/jb_sign_add_receive.png')}/>
							<Text style={styles.rowTitleStyle}>添加接收方</Text>
						</View>
						<Image style={styles.arrowStyle} source={require('../../images/jb_right_arrow.png')}/>
					</View>
				</TouchableOpacity>
				<BottomButton bgColor="#FF8084" onPress={this._nextStepPress} title='下一步'/>
			</View>
		)
	};

	render() {
		return (
		<ListView
			removeClippedSubviews={false}
			enableEmptySections={true}
			style={{backgroundColor: '#F6F6F6'}}
			dataSource={this.state.dataSource.cloneWithRows(this.state.data)}
			renderRow={this._renderRow}
			renderHeader={this._renderHeader}
			renderFooter={this._renderFooter} >
		</ListView>
		)
	}
}

const styles = StyleSheet.create({
	rowStyle: {
		marginTop: 1,
		flex: 1,
		height: 50,
		backgroundColor: 'white',
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems: 'center'
	},
	leftImageStyle: {
		width: 25,
		height: 25,
		marginLeft: 15,
	},
	rowTitleStyle: {
		width: 150,
		marginLeft: 15,
		fontSize: 16,
		color: constant.kSubTitleColor,
	},
	arrowStyle: {
		width: 24,
		height: 24,
		marginRight: 15
	}
});
