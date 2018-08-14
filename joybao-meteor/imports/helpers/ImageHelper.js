const path = require("path");
const exec = require("child_process").exec;

const ImageHelper = {};

/**
 * 图片转为目标PDF文件
 * @description 17-06-09 Promise化 56
 * @param  {[type]}   sourceArr  [需要合并为PDF的文件路径]
 * @param  {[type]}   outputPath [输出结果路径]
 * @return {[type]}            [description]
 */
ImageHelper.imgs2pdf = (sourceArr, outputPath) => new Promise((resolve, reject) => {
    if (path.extname(outputPath) !== ".pdf") {
        const err = `${outputPath} 必须为pdf后缀`;
        return reject(new Error(err));
    }

    const command = `convert ${sourceArr.join(" ")} ${outputPath}`;
    return exec(command, error => {
        if (error) {
            const err = `执行命令出错 ${error} \n command: ${command}`;
            return reject(new Error(err));
        }
        return resolve();
    });
});

/**
 * PDF转化为Images
 * @description 17-06-09 Promise化 56
 * @param  {[type]}   sourcePath [需要转换的PDF文件路径]
 * @param  {[type]}   outputDist [转换结果存储的目标文件夹]
 * @return {[type]}              [description]
 */
ImageHelper.pdf2imgs = (sourcePath, outputDist) => new Promise((resolve, reject) => {
    const command = `convert ${sourcePath} ${outputDist}`;
    return exec(command, error => {
        if (error) {
            const err = `执行命令出错 ${error} \n command: ${command}`;
            return reject(new Error(err));
        }
        return resolve();
    });
});

export default ImageHelper;
