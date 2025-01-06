import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AddCompetitionForm } from './components/AddCompetitionForm'
import { CompetitionList } from './components/CompetitionList'
import { Tournament } from './Views/Tournament/Tournament'
import Navbar from './components/Navbar/Navbar'

import './App.css'
import Home from './Views/Home/Home'

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments/new" element={<AddCompetitionForm />} />
          <Route path="/tournaments/:_id" element={<Tournament />} />
          <Route path="/tournaments" element={<CompetitionList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
