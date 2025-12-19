import React, { useState } from 'react';
import { Box, Typography, Link as MuiLink, Button, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

export const Footer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (lang?: string) => {
        setAnchorEl(null);
        if (lang) {
            i18n.changeLanguage(lang);
        }
    };

    return (
        <Box sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'text.secondary'
        }}>
            <Typography variant="body2" component="p" sx={{ mb: 1 }}>
                {t('footer.last_updated', { date: new Date().toLocaleDateString('en-CA') })}
            </Typography>
            <Box sx={{ fontFamily: 'inherit', fontWeight: 'inherit', typography: 'body2', mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                <MuiLink component={RouterLink} to="/impressum" sx={{
                    mx: 1,
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}>
                    {t('footer.legal_notice')}
                </MuiLink>
                |
                <MuiLink component={RouterLink} to="/privacy" sx={{
                    mx: 1,
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}>
                    {t('footer.privacy_policy')}
                </MuiLink>
                
                <Button
                    id="language-button"
                    aria-controls={open ? 'language-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    startIcon={<LanguageIcon />}
                    sx={{
                        color: '#1976d2',
                        textTransform: 'none',
                        mx: 1,
                        my: 0,
                        borderRadius: 1.5,
                        '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)'
                        }
                    }}
                >
                    {i18n.language === 'en' ? 'English' : 'Deutsch'}
                </Button>
            </Box>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    'aria-labelledby': 'language-button',
                }}
            >
                <MenuItem onClick={() => handleClose('en')}>English</MenuItem>
                <MenuItem onClick={() => handleClose('de')}>Deutsch</MenuItem>
            </Menu>
        </Box>
    );
};
