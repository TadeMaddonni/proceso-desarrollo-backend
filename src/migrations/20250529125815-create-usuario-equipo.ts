import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.createTable('usuario_equipos', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    usuarioId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'usuario_id',
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    equipoId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'equipo_id',
      references: {
        model: 'equipos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      field: 'created_at'
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      field: 'updated_at'
    }
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('usuario_equipos');
};
