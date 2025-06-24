import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface ZonaAttributes {
  id: string;
  nombre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ZonaCreationAttributes extends Omit<ZonaAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<ZonaAttributes, ZonaCreationAttributes>> => {
  class Zona extends Model<ZonaAttributes, ZonaCreationAttributes> implements ZonaAttributes {
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
      Zona.hasMany(models.Usuario, { foreignKey: 'zonaId' });
      Zona.hasMany(models.Partido, { foreignKey: 'zonaId' });
    }
  }

  Zona.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }  }, {
    sequelize,
    modelName: 'Zona',
    tableName: 'zonas',
    timestamps: true,
    underscored: true
  });

  return Zona;
};
