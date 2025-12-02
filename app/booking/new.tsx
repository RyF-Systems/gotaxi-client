import NewBookingScreen from '@/screens/booking/NewBookingScreen';
import { useRouter } from 'expo-router';

export default function NewBooking() {
    const router = useRouter();

    return <NewBookingScreen navigation={router} />;
}