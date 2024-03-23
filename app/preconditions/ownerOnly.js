const { Precondition } = require('@sapphire/framework')

class OwnerOnlyPrecondition extends Precondition {
  async messageRun(message) {
    return this.checkOwner(message.author.id)
  }

  async chatInputRun(interaction) {
    return this.checkOwner(interaction.user.id)
  }

  async contextMenuRun(interaction) {
    return this.checkOwner(interaction.user.id)
  }

  async checkOwner(userId) {
    return global.config.owners.includes(userId)
      ? this.ok()
      : this.error({
          message: 'Только владелец бота может использовать эту команду!'
        })
  }
}

module.exports = {
  OwnerOnlyPrecondition
}
