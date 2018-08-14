<style>
page {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgb(246, 246, 246);
}

canvas {
    height: 250px;
    width: 250px;
    margin: 40px auto 60px auto;
}

.canvas-export {
    height: 500px;
    width: 500px;
    visibility: hidden;
    top: -999999px;
    position: absolute;
}

.container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    position: relative;
}

.canvas-layout {
    top: 0;
    height: 350px;
    width: 100%;
    position: absolute;
}

.canvas-layout .canvas-title {
    position: absolute;
    top: 10rpx;
    right: 0;
    left: 0;
    text-align: center;
    width: 200rpx;
    margin: auto;
}

.canvas-layout .canvas-select {
    position: absolute;
    bottom: 20rpx;
    text-align: center;
    width: 300rpx;
    left: 0;
    right: 0;
    margin: auto;
}

.canvas-color {
    width: 60rpx;
    height: 60rpx;
    float: left;
    margin-left: 20rpx;
    margin-right: 20rpx;
    border-radius: 30rpx;
    transition: 0.3s transform ease;
}

.canvas-color.active {
    transform: scale(1.5);
}

.form-layout {
    margin-top: 30rpx;
    margin-bottom: 30rpx;
}

.form-item {
    width: 100%;
    height: 100rpx;
    background-color: #fff;
    padding: 0 30rpx;
    margin-top: 3rpx;
}

.form-layout button {
    margin-top: 10rpx;
    margin-left: 15rpx;
    margin-right: 15rpx;
}

.form-item-label {
    height: 100rpx;
    line-height: 100rpx;
    width: 20%;
    float: left;
}

.form-item-input {
    height: 100rpx;
    line-height: 100rpx;
    width: 80%;
}
</style>
<template>
    <view class="container">
        <canvas canvas-id="templateCanvas"></canvas>
        <canvas canvas-id="templateCanvasExport" class="canvas-export"></canvas>
        <view class="canvas-layout">
            <view class="canvas-title">你的签名</view>
            <view class="canvas-select">
                <repeat for="{{colors}}" key="key" index="index" item="item">
                    <view class="canvas-color {{currentColor===item.name?'active':''}}" style="background-color: {{item.value}}" @tap="changColor({{index}})"></view>
                </repeat>
            </view>
        </view>
        <view class="form-layout">
            <view wx:if="{{isCompany}}" class="form-item">
                <view class="form-item-label">横向文</view>
                <input class="form-item-input" @blur="changeHorText" maxlength="8" placeholder="不超过八个字" placeholder-style="color:#ccc" />
            </view>
            <view wx:if="{{isCompany}}" class="form-item">
                <view class="form-item-label">下弦文</view>
                <input class="form-item-input" @blur="changeEndText" placeholder="只能输入数字和-" placeholder-style="color:#ccc" />
            </view>
            <button type="primary" @tap="save">保存</button>
            <button type="default" @tap="cancel">取消</button>
        </view>
    </view>
</template>
<script>
import wepy from "wepy";
import help from "../../helps/help";
import Config from "../../config/Config";
import ConstantCode from "../../helps/ConstantCode";
import tools from "../../helps/tools";

const multiple = 2;
const context1 = wx.createCanvasContext("templateCanvas");
const context2 = wx.createCanvasContext("templateCanvasExport");

export default class sign extends wepy.page {
    config = {
        "navigationBarTitleText": "模板印章",
        "navigationBarBackgroundColor": "#539DDB",
        "navigationBarTextStyle": "white"
    }
    data = {
        /** 公司还是个人 **/
        isCompany: false,
        companyId: "",

        /** 绘制相关 **/
        currentColor: "RED",
        color: "#ff0000",
        colors: [{
            name: "RED",
            value: "#ff0000"
        }, {
            name: "BLUE",
            value: "#0000ff"
        }, {
            name: "BLACK",
            value: "#000000"
        }],
        center: 125,
        size: 120,

        /** 公司签章 **/
        companyName: "",
        horText: "",
        endText: "",

        /** 个人签章 **/
        personName: "",
        showText: "",

        isIos: false, // 判断是android 还是 ios
    }
    onLoad(options) {
        const systemInfo = wx.getSystemInfoSync();
        this.isIos = systemInfo.system.toLocaleLowerCase().includes("ios");

        this.isCompany = options.isCompany === "true";
        if (this.isCompany) {
            this.companyName = options.name;
            this.companyId = options.companyId;
        } else {
            this.personName = options.name;
        }

        if (this.personName.length === 2) {
            this.showText = `${this.personName}之印`;
        } else if (this.personName.length === 3) {
            this.showText = `${this.personName}印`;
        } else {
            this.showText = this.personName;
        }

        this.reDraw();
    }
    onUnload(){
        this.horText = "";
        this.endText = "";
    }
    reDraw(flag) {
        const ctx = flag ? context2 : context1;

        if (this.isIos) {
            console.log('Is IOS System');
            const color = flag ? 'white' : 'rgb(246, 246, 246)';
            const size = flag ? this.center * 2 * multiple : this.center * 2;
            ctx.setFillStyle(color);
            ctx.fillRect(0, 0, size, size);
            ctx.save();
        }

        ctx.setStrokeStyle(this.color);
        ctx.setFillStyle(this.color);
        ctx.setLineWidth(flag ? 7 * multiple : 7);
        if (this.isCompany) {
            this.drawCompany(flag);
        } else {
            this.drawPerson(flag);
        }
    }
    drawCompany(flag) {
        const size = flag ? this.size * multiple : this.size;
        const center = flag ? this.center * multiple : this.center;
        const ctx = flag ? context2 : context1;

        /** 绘制圆 **/
        ctx.arc(center, center, size, 0, Math.PI * 2);
        ctx.stroke();

        /** 绘制五角星 **/
        ctx.save();
        ctx.translate(center, center);
        ctx.setFillStyle(this.color);
        ctx.rotate(Math.PI);
        ctx.beginPath();
        let x;
        let y;
        const dig = Math.PI / 5 * 4;
        const starSize = flag ? 30 * multiple : 30;
        for (let i = 0; i < 5; i++) {
            x = Math.sin(i * dig);
            y = Math.cos(i * dig);
            ctx.lineTo(x * starSize, y * starSize);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        /** 绘制横向文 **/
        ctx.setFontSize(flag ? 16 * multiple : 16);
        ctx.setTextAlign("center");
        ctx.fillText(this.horText, center, (flag ? 70 * multiple : 70) + center);

        /** 绘制公司名 **/
        ctx.translate(center, center);
        ctx.setTextAlign("center");
        ctx.setFontSize(flag ? 30 * multiple : 30);
        let chars = this.companyName.split("");
        let count = chars.length;
        let angle = 4 * Math.PI / (3 * (count - 1));

        for (let i = 0; i < count; i++) {
            const c = chars[i];
            if (i === 0) {
                ctx.rotate(150 * Math.PI / 180);
            } else {
                ctx.rotate(angle);
            }
            ctx.save();
            ctx.translate(flag ? 90 * multiple : 90, 0); // 平移到此位置,此时字和x轴垂直
            ctx.rotate(Math.PI / 2); // 旋转90度,让字平行于x轴
            ctx.fillText(c, 0, 5); // 此点为字的中心点
            ctx.restore();
        }

        /** 绘制下弦文 **/
        ctx.setFontSize(flag ? multiple * 14 : 14);
        chars = this.endText.split("");
        count = chars.length;
        angle = -1 * Math.PI / (3 * (count - 1));

        for (let i = 0; i < count; i++) {
            const c = chars[i];
            if (i === 0) {
                ctx.rotate(90 * Math.PI / 180);
            } else {
                ctx.rotate(angle);
            }
            ctx.save();
            ctx.translate(flag ? multiple * 100 : 100, 0); // 平移到此位置,此时字和x轴垂直
            ctx.rotate(-1 * Math.PI / 2); // 旋转90度,让字平行于x轴
            ctx.fillText(c, 0, 5); // 此点为字的中心点
            ctx.restore();
        }

        ctx.draw();
    }
    drawPerson(flag) {
        const ctx = flag ? context2 : context1;
        const size = flag ? multiple * this.size : this.size;
        const center = flag ? multiple * this.center : this.center;

        /** 绘制框 **/
        ctx.strokeRect(center - size, center - size, size * 2, size * 2);
        ctx.stroke();

        /** 绘制文字 **/
        const chars = this.showText.split("");
        ctx.setTextAlign("center");
        ctx.setFontSize(flag ? multiple * 75 : 75);

        const offsetSize = flag ? 60 * multiple : 60;
        const offset = flag ? 25 * multiple : 25;

        ctx.fillText(chars[0], center + offsetSize, center - offsetSize + offset);
        ctx.fillText(chars[1], center + offsetSize, center + offsetSize + offset);
        ctx.fillText(chars[2], center - offsetSize, center - offsetSize + offset);
        ctx.fillText(chars[3], center - offsetSize, center + offsetSize + offset);

        ctx.draw();
    }
    async saveSign(sealObj) {
        await help.request(`${Config.host}seal.new`, sealObj).then(
            res => {
                console.log(res);
                /** TODO 隐藏进度条 **/
                help.hideToast();
                wx.navigateBack();
            },
            err => {
                console.log(err);
                /** TODO 隐藏进度条 **/
                help.hideToast();
                help.showToast(err, "error");
            }
        );
    }
    methods = {
        changColor(index) {
            this.currentColor = this.colors[index].name;
            this.color = this.colors[index].value;
            this.reDraw();
        },
        changeHorText(e) {
            this.horText = e.detail.value;
            this.reDraw();
        },
        changeEndText(e) {
            this.endText = e.detail.value;
            this.reDraw();
        },
        async save() {
            this.reDraw();
            this.reDraw(true);

            const that = this;
            help.showLoading("生成模板中");

            console.log("保存印章");
            const sealObj = {
                color: this.currentColor
            };
            if (this.isCompany) {
                sealObj.templateType = ConstantCode.SEAL.TYPE.COMPANY_SEAL;
                sealObj.companyId = this.companyId;
            } else {
                sealObj.templateType = ConstantCode.SEAL.TYPE.PERSON_SEAL;
            }

            let size = this.center * 2 * multiple;
            if (this.isIos) {
                console.log('Is IOS System');
                size -= 1;
            }
            console.log(`size is : ${size}`);
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: size,
                height: size,
                destWidth: size,
                destHeight: size,
                canvasId: "templateCanvasExport",
                success(res) {
                    tools.uploadImage(res.tempFilePath).then(
                        async res => {
                            console.log(res);
                            sealObj.imgB64 = res;
                            that.saveSign(sealObj);
                        },
                        err => {
                            console.error(err);
                        }
                    );
                },
                fail(err) {
                    help.hideToast();
                    help.showToast("生成图片错误", "error");
                }
            });
        },
        cancel() {
            wx.navigateBack();
        }
    }
}
</script>
