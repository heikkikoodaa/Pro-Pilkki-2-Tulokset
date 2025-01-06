import { useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className='navbar-title' onClick={() => navigate('/')}>Pro Pilkki 2 turnauspisteet</h1>
      </div>
    </nav>
  )
}

export default Navbar
