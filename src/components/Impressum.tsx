import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Impressum: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Impressum (Legal Notice)
                </Typography>
                <Typography variant="body1" paragraph>
                    Angaben gemäß § 5 TMG
                </Typography>
                <Typography variant="h6">Kontakt:</Typography>
                <Typography variant="body1" paragraph>
                    Email: placeholder@example.com
                </Typography>
                <Typography variant="h6">
                    Haftungsausschluss (Disclaimer)
                </Typography>
                <Typography variant="body1" paragraph>
                    Haftung für Inhalte
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Impressum;
