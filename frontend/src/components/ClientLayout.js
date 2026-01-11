'use client';


import { AuthProvider } from '../lib/auth';
import ChatBubble from '../components/ChatBubble';
import TourGuide from './TourGuide';

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            {children}
            <ChatBubble />
            <TourGuide />
        </AuthProvider>
    );
}
