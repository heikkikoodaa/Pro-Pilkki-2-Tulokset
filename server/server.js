const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Tournament = require('../models/tournament')
const Player = require('../models/player')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

const connectToDb = async () => {
  try {
    const URL = process.env.DB_URL || 'mongodb://localhost:27017'
    await mongoose.connect(URL)

    console.log('Connected to DB:', URL)
  } catch (error) {
    console.error('Could not connect to DB:', error)
  }
}

connectToDb()

wss.on('connection', (ws) => {
  console.log('WebSocket connection established')

  ws.on('message', (message) => {
    console.log('Received message', message.toString())

    const data = JSON.parse(message)

    if (data.type === 'UPDATE_SCORES') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: 'SCORES_UPDATED',
              scores: data.scores,
              competitionId: data.competitionId,
            })
          )
        }
      })
    }
  })

  ws.on('close', () => {
    console.log('WebSocket client disconnected')
  })
})

app.post('/api/competitions', async (req, res) => {
  try {
    const newCompetition = req.body
    console.log(newCompetition)
    const lakesWithoutId = newCompetition.lakes.map(({ _id, ...rest }) => rest)

    let playerIds = []
    for (const player of newCompetition.players) {
      let playerInDb = await Player.findOneAndUpdate(
        { playerName: player.playerName },
        { $setOnInsert: { playerName: player.playerName } },
        { upsert: true, new: true }
      )

      console.log('Player found or created:', playerInDb.playerName)
      playerIds.push(playerInDb._id)
    }

    const newTournament = new Tournament({
      name: newCompetition.name,
      date: newCompetition.date,
      lakes: lakesWithoutId,
      players: playerIds,
      status: newCompetition.status,
    })

    await newTournament.save()
    console.log('Tournament saved!')

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newCompetition))
      }
    })

    res.status(201).json(newTournament)
  } catch (error) {
    console.error('Error creating competition', error)
    res.status(500).json({
      error: 'Failed to create new competition',
      details: error?.message,
    })
  }
})

app.get('/api/competitions', async (req, res) => {
  try {
    const competitions = await Tournament.find().populate('players').lean()

    res.json(competitions)
  } catch (error) {
    console.error('Failed to get competitions:', error)
    res
      .status(500)
      .json({ error: 'Failed to get competitions', details: error?.message })
  }
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
