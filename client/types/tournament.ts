export interface Player {
  _id: string
  playerName: string
}

export interface Lake {
  _id: string
  lakeName: string
  compType: string
  duration: '15' | '30'
  biggestFishOwner?: string | null
}

export interface Competition {
  _id: string
  name: string
  date: string
  lakes: Lake[]
  players: Player[]
  status: 'active' | 'completed'
}

export interface Score {
  playerId: string
  lakeId: string
  score: number
}
