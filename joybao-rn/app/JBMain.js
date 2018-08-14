
import React, { Component } from 'react';
import {
	Image,
	StatusBar,
	View
} from 'react-native';

//第三方库
import { StackNavigator, TabNavigator, TabBarBottom } from 'react-navigation';

//外部文件
import AccountBook from './scene/accountBook/JBAccountBook';
import Sign from './scene/sign/JBSign';
import Mine from './scene/mine/JBMine';
import { constant } from './constant';

import PersonInfo from './scene/mine/JBPersonInfo';
import AddReceiver from './scene/sign/JBAddReceiver';
import InfoFillIn from './scene/sign/JBSignInfoFillIn';
import SignPassword from './scene/sign/JBSignPassword';
import MySignature from './scene/mine/JBMySignature';
import ContractList from './scene/mine/JBContractList';
import ResetSignPassword from './scene/mine/JBResetSignPassword';

export default class Main extends Component {
	render() {
		return (
			<View style={{flex: 1}}>
				<StatusBar barStyle='light-content'/>
				<AppNavigator/>
			</View>
		)
	}
};

const TabOptions = (navTitle, normalImage, selectedImage) => {
	// const tabBarLabel = navTitle;
	const tabBarIcon = (({tintColor, focused}) => {
		return(
			<Image
				source={!focused ? normalImage : selectedImage}
			  style={[{height: 30, width: 30}, {tintColor: tintColor}]}
			/>
		)
	});
	const title = navTitle;
	// const headerTitleStyle = {fontSize: 18, color: 'white'};
	// const headerStyle = {
	// 	backgroundColor:JBConstant.kNavBgColor,
	// 	elevation: 0,       //remove shadow on Android
	// 	shadowOpacity: 0,   //remove shadow on iOS
	// };
	// const gesturesEnabled = true;
	return {tabBarIcon, title}
};

const Home = TabNavigator({
	AccountBook: {
		screen: AccountBook,
		navigationOptions: () => TabOptions(
			'账本',
			require('./images/jb_tab_account_book_normal.png'),
			require('./images/jb_tab_account_book_select.png'),
		)
	},
	Sign: {
		screen: Sign,
		navigationOptions: () => TabOptions(
			'签署',
			require('./images/jb_tab_sign_normal.png'),
			require('./images/jb_tab_sign_select.png'),
		),
	},
	Mine: {
		screen: Mine,
		navigationOptions: () => TabOptions(
			'我的',
			require('./images/jb_tab_mine_normal.png'),
			require('./images/jb_tab_mine_select.png'),
		)
	}
},{
	tabBarOptions: {
		labelStyle: {
			fontSize: 11
		},
		tabBarComponent: TabBarBottom,
		animationEnabled: true, // 切换页面时不显示动画
		tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
		swipeEnabled: true, // 禁止左右滑动
		backBehavior: 'none', // 按 back 键是否跳转到第一个 Tab， none 为不跳转
		lazy: true, //是否根据需要懒惰呈现标签，而不是提前 默认false,推荐为true
		activeTintColor: constant.kNavBgColor, //label和icon的前景色 活跃状态下
		inactiveTintColor: constant.kSubTitleColor,//label和icon的前景色 不活跃状态下
	}
});

//所有需要跳转的页面都需要在这里注册
const AppNavigator = StackNavigator({
	Home: {
		screen: Home
	},
	AccountBook: {
		screen: AccountBook,
		path:'app/AccountBook', //使用url导航时用到, 如 web app 和 Deep Linking
	},
	Sign: {
		screen: Sign
	},
	Mine: {
		screen: Mine
	},
	PersonalInfo: {
		screen: PersonInfo,
		navigationOptions: {
			title: '个人中心'
		}
	},
	AddReceiver: {
		screen: AddReceiver,
		navigationOptions: {
			title: '添加接收人'
		}
	},
	InfoFillIn: {
		screen: InfoFillIn,
		navigationOptions: {
			title: '信息填写'
		}
	},
	SignPassword: {
		screen: SignPassword,
		navigationOptions: {
			title: '签署密码'
		}
	},
	MySignature: {
		screen: MySignature,
		navigationOptions: {
			title: '我的签名'
		}
	},
	ContractList: {
		screen: ContractList,
	},
	ResetSignPassword: {
		screen: ResetSignPassword
	}
},{
	navigationOptions: {
		statusBarStyle: 'light-content',
		headerTitleStyle: {fontSize: 18, color: 'white'},
    headerStyle: {
			backgroundColor: constant.kNavBgColor,
			elevation: 0,       //remove shadow on Android
			shadowOpacity: 0,   //remove shadow on iOS
		},
		gesturesEnabled: true,
		headerTintColor: 'white'
},
});
