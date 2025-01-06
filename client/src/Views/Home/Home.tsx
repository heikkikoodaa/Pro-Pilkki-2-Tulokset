import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home-container">
      <h1>Pro Pilkki 2 - Turnausmanageri ja pisteytykset</h1>
      <div className="options-container">
        <Link to="/tournaments" className="option-card">
          <h2>View Tournaments</h2>
          <p>Browse and check existing Pro Pilkki tournaments</p>
        </Link>
        <Link to="/tournaments/new" className="option-card">
          <h2>Create Tournament</h2>
          <p>Set up a new tournament with lakes and players</p>
        </Link>
      </div>
    </div>
  )
}

export default Home
