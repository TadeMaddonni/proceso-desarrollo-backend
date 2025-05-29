import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UsuarioEquipo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsuarioEquipo.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    usuarioId: DataTypes.UUID,
    equipoId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'UsuarioEquipo',
  });
  return UsuarioEquipo;
};