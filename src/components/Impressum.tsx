import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Impressum: React.FC = () => {
    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Impressum (Legal Notice)
                </Typography>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">Angaben gemäß § 5 TMG</Typography>
                    <Typography>
                        John Doe <br />
                        Musterstraße 1 <br />
                        12345 Musterstadt <br />
                    </Typography>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">Kontakt</Typography>
                    <Typography>
                        Telefon: +49 (0) 123 456789 <br />
                        E-Mail: john.doe@example.com
                    </Typography>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h6">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</Typography>
                    <Typography>
                        John Doe <br />
                        Musterstraße 1 <br />
                        12345 Musterstadt
                    </Typography>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>Haftungsausschluss (Disclaimer)</Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>Haftung für Inhalte</Typography>
                    <Typography paragraph>
                        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>Haftung für Links</Typography>
                    <Typography paragraph>
                        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>Urheberrecht</Typography>
                    <Typography paragraph>
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Impressum;
