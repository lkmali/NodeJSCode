import * as Sequelize from 'sequelize'
interface S3KeyAttributes {
  id: string
  s3Keys: string
  userId: Date
  counter: number
  projectFormFieldId: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<S3KeyAttributes> = {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    s3Keys: { type: Sequelize.TEXT, allowNull: false },
    userId: { type: Sequelize.UUID, allowNull: false },
    counter: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 1 },
    projectFormFieldId: { type: Sequelize.INTEGER, allowNull: false }

  }
  const S3Keys = sequelize.define('S3Keys', attributes)

  return S3Keys
}
