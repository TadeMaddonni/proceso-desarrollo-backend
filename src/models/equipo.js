import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Equipo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Equipo.belongsTo(models.Partido, { foreignKey: 'partidoId' });
      Equipo.belongsToMany(models.Usuario, { through: 'UsuarioEquipo', foreignKey: 'equipoId' });
    }
  }
  Equipo.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partidoId: DataTypes.UUID,
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Equipo',
  });
  return Equipo;
};