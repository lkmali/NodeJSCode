import fs from 'fs'
import { extend, isNil } from 'lodash'
import path from 'path'
import { Sequelize } from 'sequelize'
import { env } from '../../../config'
import { DBModels, DbModelName } from '../../../typings'
import { DbConnectionManager } from '../../base/connection/DbConnectionManager'

export class SqlConnectionManager extends DbConnectionManager {
  private static instance: DBModels | null | undefined = null
  private static db: DBModels = {
    Actions: null,
    Addresses: null,
    Clients: null,
    ClientSubscriptions: null,
    FormFieldTypes: null,
    Groups: null,
    Organizations: null,
    OrganizationServices: null,
    Password: null,
    Projects: null,
    ProjectForms: null,
    ProjectFormFields: null,
    Resources: null,
    ResourceSharing: null,
    Roles: null,
    S3Keys: null,
    Services: null,
    Subscriptions: null,
    Tasks: null,
    TaskForms: null,
    Tokens: null,
    Users: null,
    UserEvents: null,
    TaskTemplate: null,
    UserFormFieldData: null,
    UserGroups: null,
    UserGroupPermissions: null,
    UserProjectForm: null,
    UserProjects: null,
    UserRoles: null,
    UserSession: null,
    UserTasks: null,
    sequelize: null
  }

  getConnection = async () => {
    if (SqlConnectionManager.instance === null || SqlConnectionManager.instance === undefined)
      SqlConnectionManager.instance = await this.getSqlInstance()

    return SqlConnectionManager.instance
  }

  getSqlInstance = async () => {
    const sequelize = new Sequelize(env.configSqlDb)
    await sequelize.authenticate()

    const dbModelsDir = path.join(__dirname, '../models')

    // loop through all files in models directory ignoring hidden files and this file
    fs.readdirSync(dbModelsDir)
      .filter((file: string) => (file.indexOf('.') !== 0) && (file !== 'index.js') && path.extname(file) === '.js')
      // import model files and save model names
      .forEach((file: string) => {
        const call = require(path.join(dbModelsDir, file))

        const model = call.model(sequelize) as {name: DbModelName}
        SqlConnectionManager.db[model.name] = model
      })

    // invoke associations on each of the models
    Object.keys(SqlConnectionManager.db).forEach((modelName: string) => {
      // console.log('modelName', modelName)
      this.associate(modelName as DbModelName)
    })
    await sequelize.sync({
      logging: env.SQL_LOG,
      alter: env.ALTER_TABLE
    })
    const instance = {
      ...extend({
        sequelize: sequelize,
        Sequelize: Sequelize
      }, SqlConnectionManager.db),
      sequelize
    }
    return instance
  }

  associate = (modelName: DbModelName) => {
    if (!isNil(modelName) && Object.hasOwnProperty.call(SqlConnectionManager.db, modelName) &&
        !isNil(SqlConnectionManager.db[modelName]) &&
      Object.hasOwnProperty.call(SqlConnectionManager.db[modelName], 'associate'))
      SqlConnectionManager.db[modelName].associate(SqlConnectionManager.db)
  }
}
