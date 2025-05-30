import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface HistorialAttributes {
  id: string;
  usuarioId: string;
  partidoId: string;
  resultado: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HistorialCreationAttributes extends Omit<HistorialAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<HistorialAttributes, HistorialCreationAttributes>> => {  class Historial extends Model<HistorialAttributes, HistorialCreationAttributes> implements HistorialAttributes {
    declare id: string;
    declare usuarioId: string;
    declare partidoId: string;
    declare resultado: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
      Historial.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Historial.belongsTo(models.Partido, { foreignKey: 'partidoId' });
    }
  }

  Historial.init({
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
    resultado: {
      type: DataTypes.STRING,
      allowNull: false
    }  }, {
    sequelize,
    modelName: 'Historial',
    tableName: 'historiales',
    timestamps: true,
    underscored: true
  });

  return Historial;
};
