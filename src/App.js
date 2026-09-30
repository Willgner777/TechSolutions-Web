import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import AdminDevPage from './AdminDevPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dev" element={<AdminDevPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;