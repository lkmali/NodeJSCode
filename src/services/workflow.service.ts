
import axios from 'axios'
import { isNil } from 'lodash'
import { env } from '../config'
import { CreateWorkflowRequest, CreateWorkflowStage, Workflow } from '../typings'
import { customError } from '../utils'
import { TaskService } from './task.service'
export class WorkflowService {
  private static instance: WorkflowService

  public async addWorkflowStage(request: CreateWorkflowStage, token: string) {
    const result = await TaskService.Instance.copyTaskFromTaskTemplate({
      workflowName: request.workflowName,
      taskTemplateId: request.taskTemplateId,
      taskCompleteDurationInDay: request.taskCompleteDurationInDay,
      userIds: request.userIds,
      orgId: request.orgId,
      latitude: request.latitude,
      longitude: request.longitude,
      taskAddress: request.taskAddress,
      workflowId: request.workflowId,
      projectId: request.projectId,
      priority: 0
    })

    const body = {
      taskId: result.id,
      taskName: result.name,
      position: request.position,
      workflowPosition: request.workflowPosition
    } as CreateWorkflowRequest

    return this.saveWorkflowStage(body, request.workflowId, token)
  }

  public async activeWorkflow(request: CreateWorkflowStage, token: string) {
    const result = await TaskService.Instance.copyTaskFromTaskTemplate({
      workflowName: request.workflowName,
      taskTemplateId: request.taskTemplateId,
      taskCompleteDurationInDay: request.taskCompleteDurationInDay,
      userIds: request.userIds,
      orgId: request.orgId,
      latitude: request.latitude,
      longitude: request.longitude,
      taskAddress: request.taskAddress,
      workflowId: request.workflowId,
      projectId: request.projectId,
      priority: 0
    })

    const body = {
      taskId: result.id,
      taskName: result.name,
      position: request.position,
      workflowPosition: request.workflowPosition
    } as CreateWorkflowRequest

    return this.saveWorkflowStage(body, request.workflowId, token)
  }

  async saveWorkflowStage(data: CreateWorkflowRequest, workflowId: string, token: string) {
    try {
      const config = {
        method: 'post',
        url: `${env.WORK_FLOW_SERVICE_BASE_URL}/api/v1/workflow/${workflowId}/workflowStage`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        },
        data: data
      }
      const result = await axios(config)
      return result.data
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('console.data', error)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      TaskService.Instance.deleteTask(data.taskId)
      if (!isNil(error) && !isNil(error.response) && !isNil(error.response.data))
        throw customError(error.response.data.code, error.response.data.message)

      throw customError(error.response.status, error.response.message)
    }
  }

  async getWorkflowByWorkflowId(workflowId: string, token: string): Promise<Workflow> {
    try {
      const config = {
        method: 'get',
        url: `${env.WORK_FLOW_SERVICE_BASE_URL}/api/v1/workflow/${workflowId}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
      const result = await axios(config)
      return result.data
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('console.data', error.response.data)
      if (!isNil(error) && !isNil(error.response) && !isNil(error.response.data))
        throw customError(error.response.data.code, error.response.data.message)

      throw customError(error.response.status, error.response.message)
    }
  }

  async completedWorkflowStage(taskId: number, token: string) {
    try {
      const config = {
        method: 'patch',
        url: `${env.WORK_FLOW_SERVICE_BASE_URL}/api/v1/workflowStage/task/${taskId}/completed`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        },
        data: {}
      }
      const result = await axios(config)
      return result.data
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('console.data', error.data)
      if (!isNil(error) && !isNil(error.response) && !isNil(error.response.data))
        throw customError(error.response.data.code, error.response.data.message)
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
