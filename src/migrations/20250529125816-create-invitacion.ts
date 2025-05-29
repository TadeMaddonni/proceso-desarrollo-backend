import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.createTable('invitaciones', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
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
    estado: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },
    criterioOrigen: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'criterio_origen'
    },
    fechaEnvio: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'fecha_envio'
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
  await queryInterface.dropTable('invitaciones');
};
