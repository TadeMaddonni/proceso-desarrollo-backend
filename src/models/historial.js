import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Historial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Historial.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Historial.belongsTo(models.Partido, { foreignKey: 'partidoId' });
    }
  }
  Historial.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    usuarioId: DataTypes.UUID,
    partidoId: DataTypes.UUID,
    resultado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Historial',
  });
  return Historial;
};