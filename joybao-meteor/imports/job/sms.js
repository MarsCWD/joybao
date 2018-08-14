import Logger from "../helpers/Logger";
import SMSHelper from "../helpers/SMSHelper";

/**
 * 初始化短信相关Job
 * @param  {Object} jc Job 集合表
 * @return {[type]}    [description]
 */
export default jc => {
    const smsJob = new Job(jc, "sms", {})
        .repeat({ wait: 10 * 1000 }) // run ervery 10 seconds
        .delay(60 * 1000);

    smsJob.save(err => {
        if (err) {
            return Logger.error("Job save err:", "SMSJob", err);
        }
        Logger.info("SMSJob 存储成功");
        Logger.info("SMSJob 开始任务队列初始化");

        return jc.processJobs("sms", { pollInterval: 250 }, (job, cb) => {
            SMSHelper.scanSMS();

            job.done({}, { repeatId: true }); // 任务完成并且设置库中只存有唯一的Job Id
            // job.fail();
            return cb();
        });
    });
};
