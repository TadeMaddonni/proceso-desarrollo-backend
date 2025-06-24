import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface UsuarioPartidoAttributes {
  id: string;
  usuarioId: string;
  partidoId: string;
  equipo?: 'A' | 'B';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsuarioPartidoCreationAttributes extends Omit<UsuarioPartidoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<UsuarioPartidoAttributes, UsuarioPartidoCreationAttributes>> => {
  class UsuarioPartido extends Model<UsuarioPartidoAttributes, UsuarioPartidoCreationAttributes> implements UsuarioPartidoAttributes {
    declare id: string;
    declare usuarioId: string;
    declare partidoId: string;
    declare equipo?: 'A' | 'B';
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
      UsuarioPartido.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      UsuarioPartido.belongsTo(models.Partido, { foreignKey: 'partidoId' });
    }
  }

  UsuarioPartido.init({
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
    partidoId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    equipo: {
      type: DataTypes.ENUM('A', 'B'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UsuarioPartido',
    tableName: 'usuario_partidos',
    timestamps: true,
    underscored: true
  });

  return UsuarioPartido;
};
