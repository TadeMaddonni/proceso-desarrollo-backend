import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Zona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Zona.hasMany(models.Usuario, { foreignKey: 'zonaId' });
      Zona.hasMany(models.Partido, { foreignKey: 'zonaId' });
    }
  }
  Zona.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Zona',
  });
  return Zona;
};