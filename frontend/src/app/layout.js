import '../styles/globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
    title: 'VIKAS - Virtually Intelligent Knowledge Assisted Shopping',
    description: 'An Amazon-like intelligent retail assistant demonstrating the future of omnichannel commerce.',
    keywords: 'ecommerce, shopping, AI, intelligent, retail, omnichannel',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
