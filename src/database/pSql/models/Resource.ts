import * as Sequelize from 'sequelize'

interface ResourceAttributes {
  id: number
  name: string
  createdBy: string
  updatedBy: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ResourceAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    createdBy: { type: Sequelize.UUID, allowNull: true },
    updatedBy: { type: Sequelize.UUID, allowNull: true }

  }
  const Resources = sequelize.define('Resources', attributes)

  return Resources
}
