import { useLocation } from 'react-router-dom';
import { BookingProvider } from '../contexts/BookingContext';
import { BookingSuccess } from '../components/booking/BookingSuccess';

export function BookingSuccessPage() {
  const location = useLocation();
  const appointment = location.state?.appointment;

  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-xl shadow-sm border border-border p-6">
            <BookingSuccess appointment={appointment} />
          </div>
        </div>
      </div>
    </BookingProvider>
  );
}
