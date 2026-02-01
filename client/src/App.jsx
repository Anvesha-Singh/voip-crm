import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerProfile from './pages/CustomerProfile';
import CreateCustomer from './pages/CreateCustomer'; 
import CallPopup from './components/CallPopup';

function App() {
  return (
    <>
      <CallPopup />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer/:phone" element={<CustomerProfile />} />
        <Route path="/customers/new" element={<CreateCustomer />} /> 
      </Routes>
    </>
  );
}

export default App;