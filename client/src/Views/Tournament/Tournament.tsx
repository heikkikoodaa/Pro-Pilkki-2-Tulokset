import { useLocation, useNavigate } from 'react-router-dom'
import { Title } from '../../components/CompetitionList'
import styled from 'styled-components'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lake, Player } from '../../../types/tournament'
import { useEffect, useState } from 'react'

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHeader = styled.th`
  padding: 10px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
`

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: center;
`

const SubmitButton = styled.button`
  margin: 1rem;
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #388e3c;
  }
`

const BackButton = styled.button`
  margin: 1rem;
  padding: 10px 15px;
  background-color: rgb(167, 0, 0);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: rgb(120, 0, 0);
  }
`

const ScoreSchema = z.object({
  scores: z.record(
    z.record(z.string().regex(/^\d+$/, 'Score must be a number'))
  ),
})

type ScoreFormData = z.infer<typeof ScoreSchema>

export const Tournament: React.FC = () => {
  const location = useLocation()
  const competition = location.state?.competition
  const [ws, setWs] = useState<WebSocket | null>(null)
  const navigate = useNavigate()

  const { handleSubmit, control, setValue } = useForm<ScoreFormData>({
    resolver: zodResolver(ScoreSchema),
    defaultValues: {
      scores: competition?.lakes.reduce(
        (acc: Record<string, Record<string, string>>, lake: Lake) => {
          acc[lake.lakeName] = competition.players.reduce(
            (pAcc: Record<string, string>, player: Player) => {
              pAcc[player.playerName] = ''
              return pAcc
            },
            {}
          )
          return acc
        },
        {}
      ),
    },
  })

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')

    socket.onopen = () => {
      console.log('Listening form edits')
      setWs(socket)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data.toString())

      if (
        data.type === 'SCORES_UPDATED' &&
        data.competitionId === competition?._id
      ) {
        console.log('Received updated scores:', data.scores)

        for (const lakeName in data.scores) {
          for (const playerName in data.scores[lakeName]) {
            setValue(
              `scores.${lakeName}.${playerName}`,
              data.scores[lakeName][playerName]
            )
          }
        }
      }
    }

    socket.onclose = () => console.log('Websocket disconnected')

    return () => socket.close()
  }, [competition?._id, setValue])

  const onSubmit = (data: ScoreFormData) => {
    console.log('Submitted Scores:', data.scores)

    if (ws) {
      ws.send(
        JSON.stringify({
          type: 'UPDATE_SCORES',
          competitionId: competition?._id,
          scores: data.scores,
        })
      )
    }
  }

  console.log(competition)

  if (!competition) {
    return <p>Competition not found!</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Title>
        {competition.name} - {competition.date}
      </Title>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>Lake</TableHeader>
              {competition.players.map((player: Player) => (
                <TableHeader key={player._id}>{player.playerName}</TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {competition.lakes.map((lake: Lake) => (
              <tr key={lake._id}>
                <TableCell>{lake.lakeName}</TableCell>
                {competition.players.map((player: Player) => (
                  <TableCell key={player._id}>
                    <Controller
                      name={`scores.${lake.lakeName}.${player.playerName}`}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>

      <SubmitButton type="submit">Tallenna pisteet</SubmitButton>
      <BackButton onClick={() => navigate('/tournaments', { state: {} })}>
        Takaisin listaan
      </BackButton>
    </form>
  )
}
