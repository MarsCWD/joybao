import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { constant } from '../../constant';
import JBContractListCell from './JBContractListCell';

export default class JBContractList extends Component {
	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.title
	});

	constructor(props) {
		super(props);

		this.state = {
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
			],
			isRefreshing: false
		}
	};

	_onRefresh = () => {
		this.setState({
			isRefreshing: true
		});
		this.timer = setTimeout(() => {
			this.setState({
				isRefreshing: false
			})
		}, 3000);
	};

	_keyExtractor = (item, index) => {
		return item + index;
	};

	_renderItem = ({item}) => {
		return(
			<JBContractListCell item={item}/>
		)
	};

	render() {
		return(
			<FlatList
				ref={(e) => this.flatList = e}
				style={{backgroundColor: constant.kBgColor}}
				data={this.state.data}
				onRefresh={this._onRefresh}
				refreshing={this.state.isRefreshing}
				keyExtractor={this._keyExtractor}
				renderItem={this._renderItem}/>
		)
	}
}