import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface EquipoAttributes {
  id: string;
  partidoId: string;
  nombre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EquipoCreationAttributes extends Omit<EquipoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<EquipoAttributes, EquipoCreationAttributes>> => {  class Equipo extends Model<EquipoAttributes, EquipoCreationAttributes> implements EquipoAttributes {
    declare id: string;
    declare partidoId: string;
    declare nombre: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
      Equipo.belongsTo(models.Partido, { foreignKey: 'partidoId' });
      Equipo.belongsToMany(models.Usuario, { through: 'UsuarioEquipo', foreignKey: 'equipoId' });
    }
  }

  Equipo.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    partidoId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Equipo',
    tableName: 'equipos',
    timestamps: true
  });

  return Equipo;
};
