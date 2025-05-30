import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

interface InvitacionAttributes {
  id: string;
  partidoId: string;
  usuarioId: string;
  estado: string;
  criterioOrigen: string;
  fechaEnvio: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InvitacionCreationAttributes extends Omit<InvitacionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize, DataTypes: typeof import('sequelize').DataTypes): ModelStatic<Model<InvitacionAttributes, InvitacionCreationAttributes>> => {  class Invitacion extends Model<InvitacionAttributes, InvitacionCreationAttributes> implements InvitacionAttributes {
    declare id: string;
    declare partidoId: string;
    declare usuarioId: string;
    declare estado: string;
    declare criterioOrigen: string;
    declare fechaEnvio: Date;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
      Invitacion.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Invitacion.belongsTo(models.Partido, { foreignKey: 'partidoId' });
    }
  }

  Invitacion.init({
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
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },
    criterioOrigen: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaEnvio: {
      type: DataTypes.DATE,
      allowNull: false
    }  }, {
    sequelize,
    modelName: 'Invitacion',
    tableName: 'invitaciones',
    timestamps: true,
    underscored: true
  });

  return Invitacion;
};
