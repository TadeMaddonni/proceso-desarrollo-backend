import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Deporte extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Deporte.hasMany(models.Usuario, { foreignKey: 'deporteId' });
      Deporte.hasMany(models.Partido, { foreignKey: 'deporteId' });
    }
  }
  Deporte.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Deporte',
  });
  return Deporte;
};