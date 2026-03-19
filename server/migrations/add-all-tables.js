'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // 1. Localisation
    await queryInterface.createTable('Localisation', {
      id:          { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      address:     { type: Sequelize.STRING, allowNull: false },
      city:        { type: Sequelize.STRING, allowNull: false },
      postal_code: { type: Sequelize.STRING, allowNull: false },
      created_at:  { allowNull: false, type: Sequelize.DATE },
      updated_at:  { allowNull: false, type: Sequelize.DATE },
    });

    // 2. Users
    await queryInterface.createTable('Users', {
      id:            { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nom:           { type: Sequelize.STRING, allowNull: false },
      prenom:        { type: Sequelize.STRING, allowNull: false },
      username:      { type: Sequelize.STRING, allowNull: false, unique: true },
      email:         { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role:          { type: Sequelize.STRING, allowNull: false, defaultValue: 'participant' },
      created_at:    { allowNull: false, type: Sequelize.DATE },
      updated_at:    { allowNull: false, type: Sequelize.DATE },
    });

    // 3. Events  (depend de Users, Localisation)
    await queryInterface.createTable('Events', {
      id:          { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title:       { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT,   allowNull: false },
      max_people:  { type: Sequelize.INTEGER, allowNull: false },
      date:        { type: Sequelize.DATE,    allowNull: false },
      price:       { type: Sequelize.FLOAT,   allowNull: false, defaultValue: 0 },
      photos:      { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      organizer_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      location_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'Localisation', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 4. GroupChats  (depend de Events)
    await queryInterface.createTable('GroupChats', {
      id:         { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      event_id:   {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Events', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 5. Inscriptions  (depend de Users, Events)
    await queryInterface.createTable('Inscriptions', {
      id:       { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id:  {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      event_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Events', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      status:     { type: Sequelize.STRING, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 6. Messages  (depend de GroupChats, Users)
    await queryInterface.createTable('Messages', {
      id:           { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      groupchat_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'GroupChats', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      content:    { type: Sequelize.TEXT, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 7. Payments  (depend de Users, Events) — timestamps: false dans le modele
    await queryInterface.createTable('Payments', {
      id:       { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id:  {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      event_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Events', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      amount:       { type: Sequelize.FLOAT,  allowNull: false },
      status:       { type: Sequelize.STRING, allowNull: false },
      payment_date: { type: Sequelize.DATE,   allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 8. UserGroupChat  — table de jonction User <-> GroupChat
    await queryInterface.createTable('UserGroupChat', {
      id:           { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      groupchat_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'GroupChats', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserGroupChat');
    await queryInterface.dropTable('Payments');
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('Inscriptions');
    await queryInterface.dropTable('GroupChats');
    await queryInterface.dropTable('Events');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Localisation');
  },
};