import { isNil } from 'lodash'
import { AddressRepository } from '../database/repository'
import { UserAddress } from '../typings'
export class AddressService {
   private static instance: AddressService
   private readonly addressRepository: AddressRepository

   constructor () {
     this.addressRepository = new AddressRepository()
   }

   async addUserAddress (userId: string, address: Omit<UserAddress, 'id'>, createdBy: string): Promise<UserAddress> {
     const result = await this.addressRepository.getUserAddress(userId)
     if (isNil(result))
       return this.addressRepository.saveUserAddress({ ...address, createdBy })

     await this.addressRepository.updateUserAddress(userId, { ...address, updatedBy: createdBy })
     return result
   }

   async getUserAddress (userId: string): Promise<UserAddress | null> {
     return this.addressRepository.getUserAddress(userId)
   }

   public static get Instance () {
     if (isNil(this.instance))
       this.instance = new this()

     return this.instance
   }
}
