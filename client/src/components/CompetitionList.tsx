import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Competition } from '../../types/tournament'

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`

const CompList = styled.ul`
  list-style-type: none;
  padding: 0;
`

const CompetitionItem = styled.li`
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: white;
  transition: all 0.1s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    border-color: #94a3b8;
  }
`

const CompetitionLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`

const CompetitionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const CompetitionName = styled.span`
  font-weight: 600;
`

const CompetitionStatus = styled.span<{ active: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background-color: ${(props) => (props.active ? '#48bb78' : '#e2e8f0')};
  color: ${(props) => (props.active ? '#fff' : '#4a5568')};
`

const CompetitionDetails = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
`

const LakeList = styled.ul`
  list-style-type: disc;
  padding-left: 1.5rem;
`

export const CompetitionList: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([])

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/competitions')
        const data = await response.json()
        setCompetitions(data)
      } catch (error) {
        console.error('Error fetching competitions:', error)
      }
    }

    fetchCompetitions()

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3000')
    ws.onmessage = (event) => {
      console.log('Got a ws message')
      const updatedCompetition: Competition = JSON.parse(event.data)

      setCompetitions((prevCompetitions) => {
        const existingComp = prevCompetitions.find(
          (comp) => comp._id === updatedCompetition._id
        )

        if (existingComp) {
          // Update existing competition
          return prevCompetitions.map((comp) =>
            comp._id === updatedCompetition._id ? updatedCompetition : comp
          )
        } else {
          // Add new competition if it's not in the list
          return [...prevCompetitions, updatedCompetition]
        }
      })
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <ListContainer>
      <Title>Competitions</Title>
      <CompList>
        {competitions.map((competition) => (
          <CompetitionItem key={competition._id}>
            <CompetitionLink
              to={`/tournaments/${competition._id}`}
              state={{ competition }}
            >
              <CompetitionHeader>
                <CompetitionName>{competition.name}</CompetitionName>
                <CompetitionStatus active={competition.status === 'active'}>
                  {competition.status}
                </CompetitionStatus>
              </CompetitionHeader>
              <CompetitionDetails>
                <p>Kilpailupäivä: {competition.date}</p>
                <p>Järvet:</p>
                <LakeList>
                  {competition.lakes.map((lake) => (
                    <li key={lake._id}>
                      {lake.lakeName} - {lake.compType} - {lake.duration} min
                    </li>
                  ))}
                </LakeList>
                <p>Pelaajia: {competition.players.length}</p>
              </CompetitionDetails>
            </CompetitionLink>
          </CompetitionItem>
        ))}
      </CompList>
    </ListContainer>
  )
}
