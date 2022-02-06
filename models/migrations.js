exports.migrations = async () => {
  try {
    const User = require('./users')
    const Ngo = require('./ngo')
    const Shop = require('./shop')
    const Post = require('./post')
    const Campaign = require('./campaign')
    const Points = require('./points')
    const Donation = require('./donation')

    Points.belongsTo(Shop, { foreignKey: 'shopId' })
    Donation.belongsTo(Ngo, { foreignKey: 'ngoId' })
    Campaign.belongsTo(Ngo, { foreignKey: 'ngoId' })
    Donation.belongsTo(User, { foreignKey: 'userId' })
    await User.sync({ alter: true })
    await Ngo.sync({ alter: true })
    await Shop.sync({ alter: true })
    await Post.sync({ alter: true })
    await Campaign.sync({ alter: true })
    await Points.sync({ alter: true })
    await Donation.sync({ alter: true })
  } catch (err) {
    throw new Error(err)
  }
}
