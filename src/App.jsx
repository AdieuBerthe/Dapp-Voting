import { UserContextProvider } from './components/UserContextProvider';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';



function App() {
  





  return (
    <UserContextProvider>
      <AdminDashboard />
      <UserDashboard />
      </UserContextProvider>
  );
}




export default App;
