import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface PartidoAttributes {
  id: string;
  deporteId: string;
  zonaId: string;
  organizadorId: string;
  fecha: Date;
  hora: string;
  duracion: number;
  direccion: string;
  estado: string;
  equipoGanadorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PartidoCreationAttributes extends Omit<PartidoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<PartidoAttributes, PartidoCreationAttributes>> => {
  class Partido extends Model<PartidoAttributes, PartidoCreationAttributes> implements PartidoAttributes {
    declare id: string;
    declare deporteId: string;
    declare zonaId: string;
    declare organizadorId: string;
    declare fecha: Date;
    declare hora: string;
    declare duracion: number;
    declare direccion: string;
    declare estado: string;    declare equipoGanadorId?: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
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
    deporteId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    zonaId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    organizadorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    duracion: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },
    equipoGanadorId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Partido',
    tableName: 'partidos',
    timestamps: true
  });

  return Partido;
};
