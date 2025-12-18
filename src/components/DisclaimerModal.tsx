import { Modal, Box, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DisclaimerModalProps {
    open: boolean;
    onClose: () => void;
}

export const DisclaimerModal = ({ open, onClose }: DisclaimerModalProps) => {
    return (
        <Modal open={open} onClose={() => {}} disableEscapeKeyDown={true}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 500 },
                maxWidth: 500,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                outline: 'none',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        Important Disclaimer
                    </Typography>
                </Box>
                <Typography>
                    This tool is for <strong>educational and informational purposes only</strong>. It is not financial advice, legal advice, or tax advice.
                </Typography>
                <Typography>
                    <strong>Default values (like tax rates) are estimates for Berlin</strong> and may not apply to your specific situation or location. Real estate laws and tax rates are subject to change.
                </Typography>
                <Typography>
                    <strong>No Data is Stored:</strong> This application runs entirely in your browser. No personal financial data is sent to any server.
                </Typography>
                <Button variant="contained" color="primary" onClick={onClose} sx={{ mt: 2 }} fullWidth>
                    I Understand & Accept
                </Button>
            </Box>
        </Modal>
    );
};
