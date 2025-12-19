import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sanitizeHTML } from '../utils/sanitize';

interface LegalPageProps {
    translationKey: string;
}

const LegalPage: React.FC<LegalPageProps> = ({ translationKey }) => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1f2937' }}>
                    {t(`${translationKey}.title`)}
                </Typography>
                <Typography
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(t(`${translationKey}.content`))
                    }}
                />
            </Paper>
        </Container>
    );
};

export default LegalPage;
