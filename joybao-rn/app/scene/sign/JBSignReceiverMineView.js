import React, { Component } from 'react';
import {
	View,
	Image,
	Text,
	Switch
} from 'react-native';
import { constant } from '../../constant';

export default class JBSignReceiverMineView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: false,
			signProp: '无需签署'
		}
	}
	_onValueChange = (newValue) => {
		this.setState({
			value: newValue,
			signProp: newValue ? '需签署' : '无需签署'
		});
	};

	render() {
		return(
			<View style={{backgroundColor: 'white', flex: 1, height: 65, flexDirection: 'row', justifyContent: 'space-between'}}>
				<View style={{flexDirection: 'row', justifyContent: 'flex-start', flex: 1, alignItems: 'center'}}>
					<Image source={require('../../images/jb_avatar.png')} style={{marginLeft: 15, width: 45, height: 45}}/>
					<View style={{flexDirection: 'column', justifyContent: 'space-between', height: 40, marginLeft: 15}}>
						<Text style={{fontSize: 16, color: constant.kTitleColor}} numberOfLines={1}>绍兴白鲸信息技术有限公司</Text>
						<Text style={{fontSize: 12, color: constant.kSubTitleColor}}>15267108334</Text>
					</View>
				</View>

				<View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, alignItems: 'center'}}>
					<Text
						style={{color: constant.kTitleColor, fontSize: 14, marginRight: 15}}>{this.state.signProp}</Text>
					<Switch
						value={this.state.value}
						style={{marginRight: 15}}
						onValueChange={this._onValueChange}/>
				</View>
			</View>
		)
	}
}