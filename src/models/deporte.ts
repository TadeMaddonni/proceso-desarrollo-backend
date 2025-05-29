import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface DeporteAttributes {
  id: string;
  nombre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeporteCreationAttributes extends Omit<DeporteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<DeporteAttributes, DeporteCreationAttributes>> => {
  class Deporte extends Model<DeporteAttributes, DeporteCreationAttributes> implements DeporteAttributes {
    declare id: string;
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
      Deporte.hasMany(models.Usuario, { foreignKey: 'deporteId' });
      Deporte.hasMany(models.Partido, { foreignKey: 'deporteId' });
    }
  }

  Deporte.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Deporte',
    tableName: 'deportes',
    timestamps: true
  });

  return Deporte;
};
