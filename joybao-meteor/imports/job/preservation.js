import Logger from "../helpers/Logger";
import Preservation from "../helpers/Preservation";

/**
 * 初始化保全相关Job
 * @param  {Object} jc Job 集合表
 * @return {[type]}    [description]
 */
export default jc => {
    const preservationJob = new Job(jc, "preservation", {})
        .repeat({ wait: 60 * 60 * 1000 }) // run ervery 1 hour
        .delay(5 * 60 * 1000);

    preservationJob.save(err => {
        if (err) {
            return Logger.error("Job save err:", "preservationJob", err);
        }
        Logger.info("preservationJob 存储成功");
        Logger.info("preservationJob 开始任务队列初始化");

        return jc.processJobs("preservation", { pollInterval: 250 }, (job, cb) => {
            Preservation.scan();

            job.done({}, { repeatId: true }); // 任务完成并且设置库中只存有唯一的Job Id
            // job.fail();
            return cb();
        });
    });
};
