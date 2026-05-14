import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { ToastContainer } from './components/ui/Toast';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="*" element={<Navigate to="/booking" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
