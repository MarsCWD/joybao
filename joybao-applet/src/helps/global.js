/**
 * 全局缓存对象
 */
let globalData;
export default {
    getUserInfo: async() => {
        if (!globalData.userInfo) {
            globalData.userInfo = await wx.getStorage({key: "userInfo"});
        }
        if (!this._userInfo) {
            this._userInfo = globalData.userInfo;
        }

        return this._userInfo;
    },
    setUserInfo: async(v) => {
        await wepy.setStorage({key: "userInfo", data: v});
        this._userInfo = globalData.userInfo = v;
    },
    getUserToekn: async() => {
        if (!this._userToken) {
            this._userToken = await wepy.getStorage({ key: "token" });
        }
        return this._userToken;
    },
    setUserToken: async(v) => {
        await wepy.setStorage({ key: "token", data: v });
        this._userToken = v;
    },
    countDown: 60
};
