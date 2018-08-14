package com.joybao.util

import com.joybao.Logger
import com.joybao.constants.ProjectConstants
import com.joybao.constants.TaskType
import com.joybao.esign.Account
import com.joybao.esign.Contract
import com.joybao.esign.Seal
import com.timevale.esign.sdk.tech.bean.result.AddAccountResult
import com.timevale.esign.sdk.tech.bean.result.AddSealResult
import com.timevale.esign.sdk.tech.bean.result.FileDigestSignResult
import com.timevale.esign.sdk.tech.bean.result.Result

/**
 * Created by MyShe on 2017/5/14.
 */
object TaskQueue : TaskCallBack {

    private val queue: ArrayList<TaskObj> = ArrayList() // 任务执行队列
    private val waitQueue: ArrayList<TaskObj> = ArrayList() // 错误队列 等待重新执行
    private var curTask: TaskObj? = null
    var isRunning = false

    fun push(type: TaskType, obj: Any, itemId: String? = null) {
        queue.add(TaskObj(type, obj, 0, itemId))
        check()
    }

    private fun shift(): TaskObj? {
        if (queue.size != 0) return queue.removeAt(0)
        else if (waitQueue.size != 0) return waitQueue.removeAt(0)
        return null
    }

    private fun check() {
        if (queue.size != 0) this.handler(this.shift());
        else if (waitQueue.size != 0)
            this.handler(this.shift())
    }

    /**
     * 任务处理
     */
    private fun handler(obj: TaskObj?) {
        if (isRunning || obj == null) return
        if (obj.count >= ProjectConstants.TASK_RETRY) return
        isRunning = true
        obj.count += 1
        curTask = obj
        Logger.info("执行任务 ${obj.type}")
        when (obj.type) {
            TaskType.PersonNew -> Account.addPerson(obj.obj as Map<String, Any>, this)
            TaskType.CompanyNew -> Account.addOrganize(obj.obj as Map<String, Any>, this)
            TaskType.SealNew -> Seal.newSeal(obj.obj as Map<String, Any>, this)
            TaskType.ContractSignature -> Contract.startSign(obj.obj as Map<String, Any>, this)
            TaskType.ThirdCompanySealNew -> Seal.newCompanySeal(obj.obj as Map<String, Any>, this)
            else -> {
                Logger.error("handler: 未指定的任务类型")
                isRunning = false
                check()
            }
        }
    }

    /** 任务结果处理 **/
    override fun result(res: Any, vararg args: String) {
        isRunning = false
        res as Result
        when (res.errCode) {
            0 -> {
                when (curTask?.type) {
                    TaskType.PersonNew -> Account.addPersonOK(curTask?.itemId!!, args[0], res as AddAccountResult)
                    TaskType.CompanyNew -> Account.addCompanyOK(curTask?.itemId!!, args[0], res as AddAccountResult)
                    TaskType.SealNew -> Seal.newSealOK(curTask?.itemId!!, args[0], res as AddSealResult)
                    TaskType.ContractSignature -> Contract.signOK(curTask?.itemId!!, args[0], args[1], args[2], res as FileDigestSignResult)
                    TaskType.ThirdCompanySealNew -> Seal.newCompanySealOK(curTask?.itemId!!, args[0], args[1], res as AddSealResult)
                    else -> Logger.error("result: 未指定的任务类型")
                }
            }
            else -> {
                when (curTask?.type) {
                    TaskType.PersonNew -> Account.addPersonNo(curTask?.itemId!!, args[0], res)
                    TaskType.CompanyNew -> Account.addCompanyNo(curTask?.itemId!!, args[0], res as AddAccountResult)
                    TaskType.SealNew -> Seal.newSealNo(curTask?.itemId!!, args[0], res as AddSealResult)
                    TaskType.ContractSignature -> Contract.signNo(curTask?.itemId!!, args[0], args[1], args[2], res as FileDigestSignResult)
                    TaskType.ThirdCompanySealNew -> Seal.newCompanySealNo(curTask?.itemId!!, args[0], args[1], res as AddSealResult)
                }

                Logger.error("易签宝调用失败 错误码:${res.errCode} 错误信息:${res.msg}")
                waitQueue.add(curTask!!)
            }
        }
        curTask = null
        check()
    }
}