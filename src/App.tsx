import { useState } from 'react';
import {useSimulation} from './hooks/useSimulation';
import {Header} from './components/Header';
import {ResultsTable} from './components/ResultsTable';
import {Summary} from './components/Summary';
import {PaymentBreakdown} from './components/PaymentBreakdown';
import {AmortizationSchedule} from './components/AmortizationSchedule';
import {RightSection} from './components/RightSection';
import {Footer} from './components/Footer';
import {Container, Box} from '@mui/material';
import {DisclaimerModal} from './components/DisclaimerModal';

const App = () => {
    const {inputs, results, renderData, handleInputChange, handleReset} = useSimulation();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Container maxWidth={false} sx={{bgcolor: '#f3f4f6', minHeight: '100vh'}}>
            <DisclaimerModal open={isModalOpen} onClose={handleCloseModal} />
            <Box sx={{
                borderRadius: 2,
                p: {xs: 2, sm: 4},
            }}>
                <Header handleReset={handleReset}/>
                <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 4, mt: 4}}>
                    <Box sx={{flex: 1, height: '100%'}}> {/* Left Column for ResultsTable */}
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
                        position: {md: 'sticky'},
                        top: {md: '2rem'},
                        alignSelf: {md: 'flex-start'},
                        maxHeight: {md: 'calc(100vh - 4rem)'},
                        overflow: {md: 'auto'}
                    }}> {/* Right Column for other components */}
                        <RightSection inputs={inputs}/>
                        <Summary results={results} inputs={inputs}/>
                        <PaymentBreakdown results={results}/>
                        <AmortizationSchedule results={results} inputs={inputs}/>
                    </Box>
                </Box>
            </Box>
            <Footer />
        </Container>
    );
};

export default App;
