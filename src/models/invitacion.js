import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Invitacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invitacion.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Invitacion.belongsTo(models.Partido, { foreignKey: 'partidoId' });
    }
  }
  Invitacion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partidoId: DataTypes.UUID,
    usuarioId: DataTypes.UUID,
    estado: DataTypes.STRING,
    criterioOrigen: DataTypes.STRING,
    fechaEnvio: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Invitacion',
  });
  return Invitacion;
};