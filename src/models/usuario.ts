import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface UsuarioAttributes {
  id: string;
  nombre: string;
  email: string;
  contraseña: string;
  nivel: number;
  zonaId: string;
  deporteId: string;
  score?: number;
  firebaseToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id' | 'score' | 'firebaseToken' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<UsuarioAttributes, UsuarioCreationAttributes>> => {  class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    declare id: string;
    declare nombre: string;
    declare email: string;
    declare contraseña: string;
    declare nivel: number;
    declare zonaId: string;
    declare deporteId: string;
    declare score?: number;
    declare firebaseToken?: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Asociaciones
    public Zona?: any;
    public Deporte?: any;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */    static associate(models: any) {
      // define association here
      Usuario.belongsTo(models.Zona, { foreignKey: 'zonaId', as: 'Zona' });
      Usuario.belongsTo(models.Deporte, { foreignKey: 'deporteId', as: 'Deporte' });
      Usuario.hasMany(models.Partido, { foreignKey: 'organizadorId', as: 'partidosOrganizados' });
      Usuario.hasMany(models.UsuarioPartido, { foreignKey: 'usuarioId' });
      Usuario.belongsToMany(models.Partido, { 
        through: models.UsuarioPartido, 
        foreignKey: 'usuarioId',
        otherKey: 'partidoId',
        as: 'partidos'
      });
      Usuario.hasMany(models.Invitacion, { foreignKey: 'usuarioId' });
    }
  }

  Usuario.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 3
      }
    },
    zonaId: {
      type: DataTypes.UUID,
      allowNull: false
    },    deporteId: {
      type: DataTypes.UUID,
      allowNull: true
    },    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    firebaseToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'firebase_token',
      comment: 'Token de Firebase para notificaciones push'
    }}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    underscored: true
  });

  return Usuario;
};
