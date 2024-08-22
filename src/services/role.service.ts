import { isNil } from 'lodash'
import { RoleRepository } from '../database/repository'
import { Roles } from '../typings'
export class RoleService {
     private static instance: RoleService

   private readonly roleRepository: RoleRepository

   constructor () {
     this.roleRepository = new RoleRepository()
   }

   async getAllRoles (): Promise<Roles[]> {
     return this.roleRepository.getAllRole({ isDefaultAdmin: false })
   }

   public static get Instance () {
     if (isNil(this.instance))
       this.instance = new this()

     return this.instance
   }
}
