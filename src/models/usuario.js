import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Usuario.belongsTo(models.Zona, { foreignKey: 'zonaId' });
      Usuario.belongsTo(models.Deporte, { foreignKey: 'deporteId' });
      Usuario.hasMany(models.Partido, { foreignKey: 'organizadorId', as: 'partidosOrganizados' });
      Usuario.belongsToMany(models.Equipo, { through: 'UsuarioEquipo', foreignKey: 'usuarioId' });
      Usuario.hasMany(models.Invitacion, { foreignKey: 'usuarioId' });
      Usuario.hasMany(models.Historial, { foreignKey: 'usuarioId' });
    }
  }
  Usuario.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: DataTypes.STRING,
    correo: DataTypes.STRING,
    contraseña: DataTypes.STRING,
    nivel: DataTypes.INTEGER,
    zonaId: DataTypes.UUID,
    deporteId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};