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
  equipoGanador?: 'A' | 'B';
  tipoEmparejamiento: string;
  cantidadJugadores: number;
  jugadoresConfirmados: number;
  createdAt?: Date;
  updatedAt?: Date;
  nivelMinimo?: number;
  nivelMaximo?: number;
}

interface PartidoCreationAttributes extends Omit<PartidoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<PartidoAttributes, PartidoCreationAttributes>> => {  class Partido extends Model<PartidoAttributes, PartidoCreationAttributes> implements PartidoAttributes {
    declare id: string;
    declare deporteId: string;
    declare zonaId: string;
    declare organizadorId: string;
    declare fecha: Date;
    declare hora: string;
    declare duracion: number;
    declare direccion: string;
    declare estado: string;    declare equipoGanador?: 'A' | 'B';
    declare tipoEmparejamiento: string;
    declare cantidadJugadores: number;
    declare jugadoresConfirmados: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
    declare nivelMinimo?: number;
    declare nivelMaximo?: number;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */    static associate(models: any) {
      // define association here
      Partido.belongsTo(models.Usuario, { foreignKey: 'organizadorId', as: 'organizador' });
      Partido.belongsTo(models.Zona, { foreignKey: 'zonaId' });
      Partido.belongsTo(models.Deporte, { foreignKey: 'deporteId' });
      Partido.hasMany(models.UsuarioPartido, { foreignKey: 'partidoId' });
      Partido.hasMany(models.Invitacion, { foreignKey: 'partidoId' });
      Partido.belongsToMany(models.Usuario, { 
        through: models.UsuarioPartido, 
        foreignKey: 'partidoId',
        otherKey: 'usuarioId',
        as: 'participantes'
      });
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
      type: DataTypes.ENUM(
        'NECESITAMOS_JUGADORES',
        'ARMADO',
        'CONFIRMADO',
        'EN_JUEGO',
        'FINALIZADO',
        'CANCELADO'
      ),
      allowNull: false,
      defaultValue: 'NECESITAMOS_JUGADORES',
    },
    tipoEmparejamiento: {
      type: DataTypes.ENUM(
        'ZONA',
        'NIVEL',
        'HISTORIAL'
      ),
      allowNull: false,
      defaultValue: 'ZONA',
    },
    nivelMinimo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 3
      }    },
    nivelMaximo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 3
      }
    },    equipoGanador: {
      type: DataTypes.ENUM('A', 'B'),
      allowNull: true
    },    cantidadJugadores: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2,
        max: 50
      }
    },    jugadoresConfirmados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }}, {
    sequelize,
    modelName: 'Partido',
    tableName: 'partidos',
    timestamps: true,
    underscored: true
  });

  return Partido;
};
