import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Partido extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Partido.belongsTo(models.Usuario, { foreignKey: 'organizadorId', as: 'organizador' });
      Partido.belongsTo(models.Zona, { foreignKey: 'zonaId' });
      Partido.belongsTo(models.Deporte, { foreignKey: 'deporteId' });
      Partido.hasMany(models.Equipo, { foreignKey: 'partidoId' });
      Partido.hasMany(models.Invitacion, { foreignKey: 'partidoId' });
      Partido.hasMany(models.Historial, { foreignKey: 'partidoId' });
      Partido.belongsTo(models.Equipo, { foreignKey: 'equipoGanadorId', as: 'equipoGanador' });
    }
  }
  Partido.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    deporteId: DataTypes.UUID,
    zonaId: DataTypes.UUID,
    organizadorId: DataTypes.UUID,
    fecha: DataTypes.DATE,
    hora: DataTypes.TIME,
    duracion: DataTypes.FLOAT,
    direccion: DataTypes.STRING,
    estado: DataTypes.STRING,
    equipoGanadorId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Partido',
  });
  return Partido;
};