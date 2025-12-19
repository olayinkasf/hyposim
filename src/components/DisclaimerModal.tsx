import { Modal, Box, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation, Trans } from 'react-i18next';

interface DisclaimerModalProps {
    open: boolean;
    onClose: () => void;
}

export const DisclaimerModal = ({ open, onClose }: DisclaimerModalProps) => {
    const { t } = useTranslation();

    return (
        <Modal
            open={open}
            aria-labelledby="disclaimer-modal-title"
            aria-describedby="disclaimer-modal-description"
        >
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
                    <Typography id="disclaimer-modal-title" variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {t('disclaimer.title')}
                    </Typography>
                </Box>
                <Typography id="disclaimer-modal-description">
                    <Trans i18nKey="disclaimer.purpose">
                        This tool is for <strong>educational and informational purposes only</strong>. It is not financial advice, legal advice, or tax advice.
                    </Trans>
                </Typography>
                <Typography>
                    <Trans i18nKey="disclaimer.defaults">
                        <strong>Default values (like tax rates) are estimates for Berlin</strong> and may not apply to your specific situation or location. Real estate laws and tax rates are subject to change.
                    </Trans>
                </Typography>
                <Typography>
                    <Trans i18nKey="disclaimer.privacy">
                        <strong>No Data is Stored:</strong> This application runs entirely in your browser. No personal financial data is sent to any server.
                    </Trans>
                </Typography>
                <Typography>
                    <Trans i18nKey="disclaimer.cookies">
                        <strong>Cookies:</strong> We use cookies only to save your disclaimer acceptance and language preference.
                    </Trans>
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    fullWidth
                    sx={{
                        mt: 2,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': {
                            boxShadow: 4,
                        },
                    }}
                >
                    {t('disclaimer.accept')}
                </Button>
            </Box>
        </Modal>
    );
};
