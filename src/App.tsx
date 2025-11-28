import MobileOnly from './components/MobileOnly';
import Landing from './pages/Landing';
import './App.css';

function App() {
  return (
    <MobileOnly>
      <Landing />
    </MobileOnly>
  );
}

export default App;
