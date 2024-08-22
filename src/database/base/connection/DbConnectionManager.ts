import { DBModels } from '../../../typings'

export abstract class DbConnectionManager {
    // get connection from database
    abstract getConnection(): Promise<DBModels>
}
