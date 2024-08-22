import * as Sequelize from 'sequelize'
interface TokenAttributes {
  id: number
  verificationKey: string
  verifyCode: Date
  otpExpires: string
}

export const model = (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<TokenAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    verificationKey: { type: Sequelize.STRING, allowNull: false, unique: true },
    verifyCode: { type: Sequelize.STRING, allowNull: false },
    otpExpires: { type: Sequelize.DATE, allowNull: false }

  }
  const Tokens = sequelize.define('Tokens', attributes)

  return Tokens
}
