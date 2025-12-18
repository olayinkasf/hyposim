import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Container } from '@mui/material';
import { Footer } from './Footer';

const Layout: React.FC = () => {
    return (
        <Container maxWidth={false} sx={{ bgcolor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Outlet />
            </Container>
            <Footer />
        </Container>
    );
};

export default Layout;
