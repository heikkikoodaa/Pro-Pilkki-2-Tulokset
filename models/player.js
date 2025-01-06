const mongoose = require('mongoose')
const { Schema } = mongoose

const playerSchema = new Schema({
  playerName: { type: String, required: true, unique: true },
  tournamentWins: { type: Number, required: false, default: 0 },
})

const model = mongoose.model('Player', playerSchema)

module.exports = model
