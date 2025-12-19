import { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { ResultsTable } from './components/ResultsTable';
import { Summary } from './components/Summary';
import { PaymentBreakdown } from './components/PaymentBreakdown';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { RightSection } from './components/RightSection';
import { Box } from '@mui/material';
import { DisclaimerModal } from './components/DisclaimerModal';
import Cookies from 'js-cookie';

const App = () => {
    const { inputs, results, renderData, handleInputChange } = useSimulation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const disclaimerAccepted = Cookies.get('disclaimerAccepted');
        if (!disclaimerAccepted) {
            setIsModalOpen(true);
        }
    }, []);

    const handleCloseModal = () => {
        Cookies.set('disclaimerAccepted', 'true', { expires: 30 });
        setIsModalOpen(false);
    };

    return (
        <>
            <DisclaimerModal open={isModalOpen} onClose={handleCloseModal} />
            <Box sx={{
                borderRadius: 2,
            }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 4 }}>
                    <Box sx={{ flex: 1, height: '100%' }}> {/* Left Column for ResultsTable */}
                        <ResultsTable
                            renderData={renderData}
                            inputs={inputs}
                            handleInputChange={handleInputChange}
                        />
                    </Box>
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        position: { md: 'sticky' },
                        top: { md: '2rem' },
                        alignSelf: { md: 'flex-start' },
                        maxHeight: { md: 'calc(100vh - 4rem)' },
                        overflow: { md: 'auto' }
                    }}> {/* Right Column for other components */}
                        <RightSection />
                        <Summary results={results} inputs={inputs} />
                        <PaymentBreakdown results={results} />
                        <AmortizationSchedule results={results} inputs={inputs} />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default App;
