import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Privacy: React.FC = () => {
    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Datenschutzerklärung (Privacy Policy)
                </Typography>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">1. Datenschutz auf einen Blick</Typography>
                    <Typography paragraph>
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                    </Typography>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">2. Allgemeine Hinweise und Pflichtinformationen</Typography>
                    <Typography variant="h5" component="h3" sx={{ mt: 2 }}>Datenschutz</Typography>
                    <Typography paragraph>
                        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </Typography>
                    <Typography paragraph>
                        Diese Anwendung verarbeitet die von Ihnen eingegebenen Daten ausschließlich lokal in Ihrem Browser. Es werden keine personenbezogenen Daten an einen Server übermittelt oder dort gespeichert.
                    </Typography>


                    <Typography variant="h5" component="h3" sx={{ mt: 2 }}>Hinweis zur verantwortlichen Stelle</Typography>
                    <Typography paragraph>
                        Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist: <br />
                        John Doe <br />
                        Musterstraße 1 <br />
                        12345 Musterstadt <br />
                        Telefon: +49 (0) 123 456789 <br />
                        E-Mail: john.doe@example.com
                    </Typography>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">3. Datenerfassung auf dieser Website</Typography>
                    <Typography paragraph>
                        Da diese Anwendung vollständig im Browser des Benutzers ausgeführt wird, werden keine persönlichen Finanzdaten an einen Server gesendet oder dort gespeichert. Alle eingegebenen Daten verbleiben ausschließlich auf Ihrem Gerät.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Privacy;
