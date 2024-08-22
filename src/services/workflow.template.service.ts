
import axios from 'axios'
import { isNil } from 'lodash'
import { env } from '../config'
import { CreateWorkflowTemplateRequest, CreateWorkflowTemplateStage, Workflow } from '../typings'
import { customError } from '../utils'
import { TaskTemplateService } from './taskTemplate.service'
export class WorkflowTemplateService {
  private static instance: WorkflowTemplateService

  public async addWorkflowTemplateStage(request: CreateWorkflowTemplateStage, token: string) {
    const data = await TaskTemplateService.Instance.getTaskTemplate(request.taskTemplateId, request.orgId)
    const body = {
      taskTemplateId: data.id,
      taskTemplateName: data.name,
      position: request.position,
      workflowPosition: request.workflowPosition

    } as CreateWorkflowTemplateRequest

    return this.saveWorkflowTemplateStage(body, request.workflowTemplateId, token)
  }

  async saveWorkflowTemplateStage(data: CreateWorkflowTemplateRequest, workflowTemplateId: string, token: string) {
    try {
      const config = {
        method: 'post',
        url: `${env.WORK_FLOW_SERVICE_BASE_URL}/api/v1/workflowTemplate/${workflowTemplateId}/stage`,
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
