const mongoose = require('mongoose')
const { Schema } = mongoose

const lakeSchema = new Schema({
  lakeName: { type: String, required: true },
  compType: { type: String, required: true },
  duration: { type: String, enum: ['15', '30'], required: true },
  biggestFishOwner: { type: String, default: null },
})

const tournamentSchema = new Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  lakes: [lakeSchema],
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
  status: { type: String, enum: ['active', 'completed'], required: true },
})

const model = mongoose.model('Tournament', tournamentSchema)

module.exports = model
