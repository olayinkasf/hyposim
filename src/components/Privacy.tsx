import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Privacy: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Datenschutzerklärung (Privacy Policy)
                </Typography>
                <Typography variant="body1" paragraph>
                    Wir legen größten Wert auf den Schutz Ihrer Daten und die Wahrung Ihrer Privatsphäre. Nachstehend informieren wir Sie deshalb über die Erhebung und Verwendung persönlicher Daten bei Nutzung unserer Webseite.
                </Typography>
                <Typography variant="h6">
                    Datenerfassung auf unserer Website
                </Typography>
                <Typography variant="body1" paragraph>
                    Verantwortlicher für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist der Betreiber dieser Seite.
                </Typography>
                <Typography variant="h6">
                    Ihre Rechte als Betroffener
                </Typography>
                <Typography variant="body1" paragraph>
                    Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Privacy;
