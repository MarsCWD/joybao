import React, { Component } from 'react';
import {
	ListView,
	View,
	TouchableHighlight,
	TouchableOpacity,
	Image,
	StyleSheet,
	Text
} from 'react-native';

export default class JBSignImageListCell extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
		}
	}

	_renderRow = ({image}, sectionID, rowID) => {
		if (parseInt(rowID) === 0) {//快捷签
			return(
				<TouchableHighlight style={{marginLeft: 15}}>
					<View style={{flex: 1, alignItems: 'center'}}>
						<Image source={image} style={styles.imageStyle}>
							<View style={{backgroundColor: '#00000030', flex: 1, justifyContent: 'flex-end'}}>
								<Text style={{color: 'white', fontSize: 16, textAlign: 'center'}}>快捷签</Text>
								<View style={{height: 60 - 8, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
									<Image source={require('../../images/jb_sign_selected.png')} style={styles.templateImageStyle}/>
								</View>
							</View>
						</Image>
					</View>
				</TouchableHighlight>
			)
		} else if (parseInt(rowID) === this.props.data.length - 1) {//添加码单/对账单按钮
			return(
				<TouchableHighlight onPress={this.props.addStatements} style={{marginLeft: 15, marginRight: 15}}>
					<View style={{flex: 1}}>
						<Image source={image} style={styles.imageStyle}/>
					</View>
				</TouchableHighlight>
			)
		} else {
			return(
				<TouchableHighlight style={{marginLeft: 15}}>
					<View style={{flex: 1}}>
						<Image source={image} style={[styles.imageStyle, {justifyContent: 'flex-end'}]}>
							<TouchableOpacity
								style={{height: 25, backgroundColor: '#00000030', justifyContent: 'center', alignItems: 'center'}}
								onPress={() => {this.props.deleteImage(parseInt(rowID))}}>
								<Image source={require('../../images/jb_sign_delete.png')} style={{width: 20, height: 20}}/>
							</TouchableOpacity>
						</Image>
					</View>
				</TouchableHighlight>
			)
		}
	};

	render() {
		return(
			<ListView
				enableEmptySections={true}
				removeClippedSubviews={false}
				style={{backgroundColor:'white', height: 150}}
				contentContainerStyle={styles.contentContainer}
				dataSource={this.state.dataSource.cloneWithRows(this.props.data)}
				renderRow={this._renderRow}
				horizontal={true}
				showsHorizontalScrollIndicator={false} />
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 15, marginBottom: 15, marginRight: 15
	},
	imageStyle: {
		resizeMode:'cover', width: 90, height: 120
	},
	templateImageStyle: {
		marginRight: 5, marginBottom: 5, width: 20, height: 20
	}
});