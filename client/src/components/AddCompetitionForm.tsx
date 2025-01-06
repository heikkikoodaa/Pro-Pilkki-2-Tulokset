import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import styled from 'styled-components'
import { Competition, Lake, Player } from '../../types/tournament'
import { generateRandomId } from '../utils/utils'
import { useNavigate } from 'react-router-dom'

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: bold;
`

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0051a2;
  }
`

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
`

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
`

const RemoveButton = styled(Button)`
  background-color: #ff4136;

  &:hover {
    background-color: #dc352a;
  }
`

const competitionSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Competition name must be at least 2 characters.' }),
  date: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Convert from YYYY-MM-DD to DD.MM.YYYY before validation
        return val.split('-').reverse().join('.')
      }
      return val
    },
    z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, {
      message: 'Please enter a valid date in DD.MM.YYYY format.',
    })
  ),
})

const lakeSchema = z.object({
  lakeName: z
    .string()
    .min(2, { message: 'Lake name must be at least 2 characters.' }),
  compType: z.string().min(2, { message: 'Competition type is required.' }),
  duration: z.enum(['15', '30'], {
    required_error: 'Please select a duration.',
  }),
})

const playerSchema = z.object({
  playerName: z
    .string()
    .min(2, { message: 'Player name must be at least 2 characters.' }),
})

type CompetitionFormData = z.infer<typeof competitionSchema>
type LakeFormData = z.infer<typeof lakeSchema>
type PlayerFormData = z.infer<typeof playerSchema>

enum FormStep {
  TOURNAMENT_INFO = 0,
  LAKES = 1,
  PLAYERS = 2,
}

export const AddCompetitionForm: React.FC = () => {
  const [lakes, setLakes] = useState<Lake[]>([])
  const [players, setPlayers] = useState<Player[]>([])

  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<FormStep>(
    FormStep.TOURNAMENT_INFO
  )

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const competitionForm = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: '',
      date: '',
    },
  })

  const lakeForm = useForm<LakeFormData>({
    resolver: zodResolver(lakeSchema),
    defaultValues: {
      lakeName: '',
      compType: '',
      duration: '15',
    },
  })

  const playerForm = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      playerName: '',
    },
  })

  const onSubmitLake = (data: LakeFormData) => {
    const newLake: Lake = { ...data, _id: generateRandomId() }
    setLakes((prevLakes) => [...prevLakes, newLake])
    lakeForm.reset()
    console.log('Lakes', lakes)
  }

  const onSubmitPlayer = (data: PlayerFormData) => {
    const newPlayer: Player = { ...data, _id: generateRandomId() }
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer])
    playerForm.reset()
  }

  const removeLake = (id: string) => {
    setLakes(lakes.filter((lake) => lake._id !== id))
  }

  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player._id !== id))
  }

  const onSubmitCompetition: SubmitHandler<CompetitionFormData> = async (
    data
  ) => {
    try {
      const newCompetition: Competition = {
        ...data,
        _id: generateRandomId(),
        lakes,
        players,
        status: 'active',
      }
      console.log('Submitting competition:', JSON.stringify(newCompetition))

      const response = await fetch('http://localhost:3000/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompetition),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create competition: ${errorData}`)
      }

      const result = await response.json()
      console.log('Competition created:', result)

      alert('Competition created successfully!')
      competitionForm.reset()
      playerForm.reset()
      lakeForm.reset()
      setLakes([])
      setPlayers([])
      navigate('/tournaments')
    } catch (error) {
      console.error('Error creating competition:', error)
      alert('Failed to create competition. Please try again.')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case FormStep.TOURNAMENT_INFO:
        return (
          <FormGroup>
            <h2>Tournament Information</h2>
            <FormGroup>
              <Label htmlFor="name">Competition Name</Label>
              <Input
                id="name"
                type="text"
                {...competitionForm.register('name')}
                placeholder="Winter Freeze 2023"
              />
              {competitionForm.formState.errors.name && (
                <ErrorMessage>
                  {competitionForm.formState.errors.name.message}
                </ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...competitionForm.register('date')}
                value={(competitionForm.watch('date') || '')
                  .split('.')
                  .reverse()
                  .join('-')}
                onChange={(e) => {
                  const date = new Date(e.target.value)
                  const day = String(date.getDate()).padStart(2, '0')
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const year = date.getFullYear()
                  const formattedDate = `${day}.${month}.${year}`
                  competitionForm.setValue('date', formattedDate, {
                    shouldValidate: true,
                  }) // Ensure validation is triggered
                }}
              />
              {competitionForm.formState.errors.date && (
                <ErrorMessage>
                  {competitionForm.formState.errors.date.message}
                </ErrorMessage>
              )}
            </FormGroup>

            <Button
              type="button"
              onClick={() => {
                if (competitionForm.formState.isValid) nextStep()
              }}
            >
              Next
            </Button>
          </FormGroup>
        )

      case FormStep.LAKES:
        return (
          <FormGroup>
            <h2>Add Lakes</h2>
            <FormGroup>
              <Label htmlFor="lakeName">Lake Name</Label>
              <Input
                id="lakeName"
                type="text"
                {...lakeForm.register('lakeName')}
                placeholder="Jormuanlahti"
              />
              {lakeForm.formState.errors.lakeName && (
                <ErrorMessage>
                  {lakeForm.formState.errors.lakeName.message}
                </ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="compType">Competition Type</Label>
              <Input
                id="compType"
                type="text"
                {...lakeForm.register('compType')}
                placeholder="Kaikki lajit"
              />
              {lakeForm.formState.errors.compType && (
                <ErrorMessage>
                  {lakeForm.formState.errors.compType.message}
                </ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="duration">Duration</Label>
              <Select id="duration" {...lakeForm.register('duration')}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </Select>
              {lakeForm.formState.errors.duration && (
                <ErrorMessage>
                  {lakeForm.formState.errors.duration.message}
                </ErrorMessage>
              )}
            </FormGroup>
            <Button type="button" onClick={lakeForm.handleSubmit(onSubmitLake)}>
              Add Lake
            </Button>

            {/* Display the list of added lakes */}
            {lakes.length > 0 && (
              <FormGroup>
                <h4>Added Lakes</h4>
                <List>
                  {lakes.map((lake) => (
                    <ListItem key={lake._id}>
                      <span>
                        {lake.lakeName} - {lake.compType} - {lake.duration} min
                      </span>
                      <RemoveButton
                        type="button"
                        onClick={() => removeLake(lake._id)}
                      >
                        Remove
                      </RemoveButton>
                    </ListItem>
                  ))}
                </List>
              </FormGroup>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </div>
          </FormGroup>
        )

      case FormStep.PLAYERS:
        return (
          <FormGroup>
            <h2>Add Players</h2>
            <FormGroup>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                type="text"
                {...playerForm.register('playerName')}
                placeholder="John Doe"
              />
              {playerForm.formState.errors.playerName && (
                <ErrorMessage>
                  {playerForm.formState.errors.playerName.message}
                </ErrorMessage>
              )}
            </FormGroup>
            <Button
              type="button"
              onClick={() => playerForm.handleSubmit(onSubmitPlayer)()}
            >
              Add Player
            </Button>

            {players.length > 0 && (
              <FormGroup>
                <h4>Added Players</h4>
                <List>
                  {players.map((player) => (
                    <ListItem key={player._id}>
                      <span>{player.playerName}</span>
                      <RemoveButton
                        type="button"
                        onClick={() => removePlayer(player._id)}
                      >
                        Remove
                      </RemoveButton>
                    </ListItem>
                  ))}
                </List>
              </FormGroup>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button
                onClick={competitionForm.handleSubmit(
                  (data) => {
                    console.log('✅ Form submitted with data:', data)
                    onSubmitCompetition(data)
                  },
                  (errors) => {
                    console.log('❌ Form validation errors:', errors)
                  }
                )}
              >
                Create Competition
              </Button>
            </div>
          </FormGroup>
        )
    }
  }

  return (
    <FormContainer>
      <div>
        <h3>Step {currentStep + 1} of 3</h3>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#eee',
            borderRadius: '4px',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              width: `${((currentStep + 1) / 3) * 100}%`,
              height: '100%',
              backgroundColor: '#0070f3',
              borderRadius: '4px',
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </div>
      </div>
      <Form onSubmit={competitionForm.handleSubmit(onSubmitCompetition)}>
        {renderStep()}
      </Form>
    </FormContainer>
  )
}
