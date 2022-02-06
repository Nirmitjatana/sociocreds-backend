const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  postId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  postTitle: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  postDescription: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  postPhotoUrl: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  ngoId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Ngos',
      key: 'ngoId'
    }
  }
}

const options = {
  timestamps: true
}
const Post = db.define('Post', schema, options)

module.exports = Post
