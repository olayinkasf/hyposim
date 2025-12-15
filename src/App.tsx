
import { useSimulation } from './hooks/useSimulation';
import { Header } from './components/Header';
import { ResultsTable } from './components/ResultsTable';
import { Summary } from './components/Summary';
import { PaymentBreakdown } from './components/PaymentBreakdown';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { Footer } from './components/Footer';
import './App.css';

const App = () => {
    const { inputs, results, renderData, handleInputChange } = useSimulation();
    const desiredMonthlyCost = inputs.desiredMonthlyCost;

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-gray-50">
            <div className="mx-auto bg-white shadow-2xl rounded-xl p-6 sm:p-10 border border-gray-100">
                <Header />
                <ResultsTable
                    renderData={renderData}
                    inputs={inputs}
                    handleInputChange={handleInputChange}
                    desiredMonthlyCost={desiredMonthlyCost}
                />
                <Footer inputs={inputs} />
                <Summary results={results} inputs={inputs} />
                <PaymentBreakdown results={results} />
                <AmortizationSchedule results={results} inputs={inputs} />
            </div>
        </div>
    );
};

export default App;
