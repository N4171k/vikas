'use client';

import { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

export default function TourGuide() {
    const [run, setRun] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const tourSeen = localStorage.getItem('vikas_tour_seen');
        if (!tourSeen) {
            setRun(true);
        }
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('vikas_tour_seen', 'true');
        }
    };

    const steps = [
        {
            target: 'body',
            content: 'Welcome to VIKAS! Let me show you around our virtually intelligent shopping assistant.',
            placement: 'center',
            title: 'Welcome 👋',
            disableBeacon: true,
        },
        {
            target: '#tour-search',
            content: 'Search for any product here. You can valid natural language queries too!',
            title: 'Smart Search 🔍',
        },
        {
            target: '#tour-store-finder',
            content: 'Locate nearby stores. You can also Reserve products from any product page and pick them up offline!',
            title: 'Offline Reservation 📍',
        },
        {
            target: '#tour-account',
            content: 'Manage your profile, view orders, and login/signup here.',
            title: 'Your Account 👤',
        },
        {
            target: '#tour-cart',
            content: 'View your selected items and proceed to checkout here.',
            title: 'Your Cart 🛒',
        },
        {
            target: '#tour-ai-chat',
            content: 'Need help? Click here to chat with our AI assistant for personalized recommendations!',
            title: 'AI Assistant 🤖',
        }
    ];

    if (!mounted) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    primaryColor: '#2563eb', // Blue-600 to match theme likely
                    zIndex: 10000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: '#2563eb',
                },
                buttonBack: {
                    color: '#2563eb',
                }
            }}
            callback={handleJoyrideCallback}
        />
    );
}
