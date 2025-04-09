import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Main from './components/Main';

function App() {
  return (
      <Router>
          <div className="flex">
              <Sidebar />
              <div className="flex-1 p-4">
                  <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tables" element={<Main />} />
                      {/* <Route path="/settings" element={<Settings />} /> */}
                      <Route path="/" element={<Dashboard />} /> {/* Default route */}
                  </Routes>
              </div>
          </div>
      </Router>
  );
}

export default App;