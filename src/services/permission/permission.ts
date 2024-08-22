import { isNil } from 'lodash'
import data from '../../data/permission.json'
export class PermissionService {
  private static instance: PermissionService

    private readonly permission: any

    constructor() {
      this.permission = data
    }

    getPermission(role: string): {[key: string]: string} {
      if (Object.prototype.hasOwnProperty.call(this.permission, role))
        return this.permission[role]
      else
        return {}
    }

    public static get Instance() {
      if (isNil(this.instance))
        this.instance = new this()

      return this.instance
    }
}
