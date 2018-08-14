import { Meteor } from "meteor/meteor";
import { JobCollection } from "meteor/vsivsi:job-collection";

import Logger from "../helpers/Logger";

import SMSJobInit from "./sms";
import PreservationJobInit from "./preservation";

const jc = new JobCollection("Jobs", { idGeneration: "String" });
jc.remove({});

/** 服务端相关 */
if (Meteor.isServer) {
    // jc.setLogStream(process.stdout) // 输出Job执行时的一些输出
    jc.promote(250);
}

SMSJobInit(jc);
PreservationJobInit(jc);

/** Remove old Jobs that can be removed */
const clearJob = new Job(jc, "clearJob", {})
    .repeat({ wait: 60 * 60 * 1000 })
    .delay(60 * 1000);

clearJob.save(err => {
    if (err) {
        return Logger.error("Job save err:", "clearJob", err);
    }

    Logger.info("clearJob 存储成功");
    Logger.info("clearJob 开始任务队列初始化");

    return jc.processJobs("clearJob", { pollInterval: 250 }, (job, cb) => {
        const res = jc.remove({ status: { $in: ["cancelled", "completed", "failed"] } });

        Logger.info("clear Jobs");
        Logger.info(res);

        job.done({}, { repeatId: true }); // 任务完成并且设置库中只存有唯一的Job Id
        // job.fail();
        return cb();
    });
});

jc.startJobServer(); // 开启JobServer
