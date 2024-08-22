import { Application, Request, Response } from 'express'
import { isNil } from 'lodash'
export class RequestInterception {
 requestInterception = (app: Application) => {
   app.use((request: Request, _response: Response, next: Function) => {
     if (!isNil(request['query']))
       request['query'] = this.filterRequest(request['query'] as {[key: string]: string})

     if (!isNil(request['body']))
       request['body'] = this.filterRequest(request['body'])

     next()
   })
 }

    filterRequest = (data: {[key: string]: string}): {[key: string]: string} => {
      if (!isNil(data.email))
        data['email'] = data.email.trim().toLowerCase()

      if (!isNil(data.projectOwner))
        data['projectOwner'] = data.projectOwner.trim().toLowerCase()

      if (!isNil(data.organizationAdminEmail))
        data['organizationAdminEmail'] = data.organizationAdminEmail.trim().toLowerCase()

      if (!isNil(data.name))
        data['name'] = data.name.trim().replaceAll(/\s\s+/g, ' ')

      if (!isNil(data.organizationAdminName))
        data['organizationAdminName'] = data.organizationAdminName.trim().replaceAll(/\s\s+/g, ' ')

      if (!isNil(data.organizationsName))
        data['organizationsName'] = data.organizationsName.trim().replaceAll(/\s\s+/g, ' ')

      if (!isNil(data.username))
        data['username'] = data.username.trim().replaceAll(/\s\s+/g, ' ')

      if (!isNil(data.groupName))
        data['groupName'] = data.groupName.trim().replaceAll(/\s\s+/g, ' ')

      if (!isNil(data.clientName))
        data['clientName'] = data.clientName.trim().replaceAll(/\s\s+/g, ' ')

      return data
    }
}
