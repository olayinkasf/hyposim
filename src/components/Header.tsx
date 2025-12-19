import React from 'react';
import {Typography, Box} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            width: '100%',
            bgcolor: '#f3f4f6',
            zIndex: 1100,
            p: {xs: 1, sm: 2},
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <img src="/logo.jpg" alt="Hyposim Logo" style={{height: '40px', marginRight: '16px'}}/>
                    <div>
                        <Typography variant="h5" component="h1" sx={{fontWeight: 800, color: '#1f2937'}}>
                            {t('header.title')}
                        </Typography> <Typography variant="body2" sx={{color: '#6b7280'}}>
                        {t('header.subtitle')}
                    </Typography>
                    </div>
                </Box>
            </Link>
        </Box>
    );
};
