import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface UsuarioEquipoAttributes {
  id: string;
  usuarioId: string;
  equipoId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsuarioEquipoCreationAttributes extends Omit<UsuarioEquipoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<UsuarioEquipoAttributes, UsuarioEquipoCreationAttributes>> => {  class UsuarioEquipo extends Model<UsuarioEquipoAttributes, UsuarioEquipoCreationAttributes> implements UsuarioEquipoAttributes {
    declare id: string;
    declare usuarioId: string;
    declare equipoId: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
    }
  }

  UsuarioEquipo.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    equipoId: {
      type: DataTypes.UUID,
      allowNull: false
    }  }, {
    sequelize,
    modelName: 'UsuarioEquipo',
    tableName: 'usuario_equipos',
    timestamps: true,
    underscored: true
  });

  return UsuarioEquipo;
};
