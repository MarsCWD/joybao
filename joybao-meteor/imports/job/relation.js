import Logger from "../helpers/Logger";
import RelationHelper from "../helpers/RelationHelper";

/**
 * 初始化关系表Job
 * @param  {[type]} jc [description]
 * @return {[type]}    [description]
 */
export default jc => {
    const wait = 5 * 60 * 1000; // repeat 5 minutes
    const relationJob = new Job(jc, "relation", {})
        .repeat({ wait })
        .delay(2 * 60 * 1000);

    relationJob.save(err => {
        if (err) {
            return Logger.error("Job save err:", "relationJob", err);
        }
        Logger.info("relationJob 存储成功");
        Logger.info("relationJob 开始任务队列初始化");

        return jc.processJobs("relation", { pollInterval: 250 }, (job, cb) => {
            RelationHelper.scan();

            job.done({}, { repeatId: true }); // 任务完成并且设置库中只存有唯一的Job Id
            return cb();
        });
    });
};
