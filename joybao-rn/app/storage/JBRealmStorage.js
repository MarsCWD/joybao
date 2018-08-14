let RealmBase = {};

import Realm from 'realm';

const HistoryReceiver = {
	name: 'HistoryReceiver',
	properties: {
		id: 'int',
		avatar: 'string',
		name: 'string',
		phoneNumber: 'string'
	}
};

let realm = new Realm({schema:HistoryReceiver});

// 添加数据
RealmBase.create = function (scheme, data) {
	realm.write(() => {
		for (let i = 0; i < data.length; i++) {
			let temp = data[i];
			realm.create(scheme,
				{
					id: temp.id,
					avatar: temp.avatar,
					name: temp.name,
					phoneNumber: temp.phoneNumber
				});
		}
	})
};

//获取前五条数据，不足五条则全部取出
RealmBase.loadTopFiveData = function (scheme) {
	let objects = realm.objects(scheme);
	let count = 5;
	if (objects.length < 5) {
		return objects;
	}
	let data = [];
	for (let i = 0; i < count; i ++) {
		data.push(objects[i]);
	}
	return data;
};

export default RealmBase;