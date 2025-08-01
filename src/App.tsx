import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';
import RTLDemo from './pages/RTLDemo';
import ShadCNDemo from './pages/ShadCNDemo';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/rtl-demo" element={<RTLDemo />} />
        <Route path="/shadcn-demo" element={<ShadCNDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
