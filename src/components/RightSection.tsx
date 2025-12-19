import React from 'react';
import {Box, Typography} from '@mui/material';
import {useTranslation, Trans} from 'react-i18next';

interface RightSectionProps {
}

export const RightSection: React.FC<RightSectionProps> = () => {
    const {t} = useTranslation();

    return (
        <Box sx={{
            mt: 3,
            p: 2,
            borderLeft: '4px solid #9ca3af',
            bgcolor: '#f9fafb',
            borderRadius: 1,
            color: '#4b5563'
        }}>
            <Typography variant="subtitle2" component="h3" sx={{fontWeight: 600, color: '#374151', mb: 1}}>
                {t('rightSection.title')}
            </Typography>
            <Typography variant="caption" component="p" sx={{display: 'block', lineHeight: 1.5, fontSize: '0.8rem'}}>
                <Trans i18nKey="rightSection.explanation">
                    Your <strong>Total Cash Out</strong> includes the <strong>Total Principal Paid</strong>. This is
                    because principal payments are cash that has left your liquid assets and been invested into the
                    property. While this portion of your cash out is not permanently lost (it is converted into home
                    equity and is returned to you in the <strong>Net Sale Proceeds</strong>), it is also not available
                    for other investments during the holding period. The <strong>Total Interest Paid</strong> and other
                    running costs, on the other hand, represent the 'cash lost' portion of your investment.
                </Trans>
            </Typography>
        </Box>
    );
};

