import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.createTable('historiales', {
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
    partidoId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'partido_id',
      references: {
        model: 'partidos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    resultado: {
      type: Sequelize.STRING,
      allowNull: true
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
  await queryInterface.dropTable('historiales');
};
