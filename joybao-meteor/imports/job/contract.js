import Logger from "../helpers/Logger";

export default jc => {
    const contractJob = new Job(jc, "contract", {})
        .repeat({ wait: 60 * 60 * 1000 }) // run ervery one hour
        .delay(100 * 1000);

    contractJob.save(err => {
        if (err) {
            return Logger.error("Job save err:", "contractJob", err);
        }

        Logger.info("contractJob 存储成功");
        Logger.info("contractJob 开始任务队列初始化");

        return jc.processJobs("contract", { pollInterval: 250 }, (job, cb) => {
            // TODO contractJob work content
            Logger.info("contractJob work once");
            job.done({}, { repeatId: true });
            return cb();
        });
    });
};
