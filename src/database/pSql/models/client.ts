import * as Sequelize from 'sequelize'

interface ClientAttributes {
 id: number
name: string
isActive: boolean
isDelete: boolean
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ClientAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    isDelete: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  // const Clients = sequelize.define<UserInstance, UserAttributes>('Clients', attributes)
  const Clients = sequelize.define('Clients', attributes)
  // @ts-ignore
  // Clients.associate = function (models: any) {
  //   Clients.belongsToMany(models.Organizations, { through: models.Organizations, foreignKey: '' })
  // }

  return Clients
}
