import React, { Component } from 'react';
import {
	ScrollView,
	View
} from 'react-native';
import { constant } from '../../constant';
import PersonInfoCell from './JBPersonInfoCell';
import { SeparatorView } from '../../common';

export default class JBPersonInfo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: []
		}
	}

	_resetSignPassword = () => {
		this.props.navigation.navigate('ResetSignPassword');
	};

	render() {
		return(
			<ScrollView style={{backgroundColor: constant.kBgColor}}>
				<SeparatorView/>
				<PersonInfoCell avatar={require('../../images/jb_avatar.png')} title="头像"/>
				<PersonInfoCell showArrow={false} title="昵称" subTitle="Vedor"/>
				<SeparatorView/>
				<PersonInfoCell showArrow={true} title="手机号码" subTitle="15267108334"/>
				<PersonInfoCell showArrow={true} title="签署密码" subTitle="已设置" onPress={this._resetSignPassword}/>
				<SeparatorView/>
				<PersonInfoCell showArrow={true} title="实名认证" subTitle="已实名认证"/>
			</ScrollView>
		)
	}
}