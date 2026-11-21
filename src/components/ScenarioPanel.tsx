import React, {useEffect, useState} from 'react';
import {Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {useTranslation} from 'react-i18next';
import type {SimulationInput} from '../types';
import {calculateSimulation} from '../data';
import {format} from '../formatters';
import {encodeInputs, withDefaults} from '../hooks/useSimulation';

interface SavedFlat {
    name: string;
    inputs: SimulationInput;
    savedAt: string;
}

const STORAGE_KEY = 'hyposim.flats';

const readFlats = (): SavedFlat[] => {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(raw)) return [];
        return raw
            .filter((f) => f && typeof f.name === 'string' && f.inputs)
            .map((f) => ({name: f.name, inputs: withDefaults(f.inputs), savedAt: String(f.savedAt || '')}));
    } catch {
        return [];
    }
};

interface Props {
    inputs: SimulationInput;
    onLoad: (inputs: SimulationInput) => void;
}

export const ScenarioPanel: React.FC<Props> = ({inputs, onLoad}) => {
    const {t} = useTranslation();
    const [flats, setFlats] = useState<SavedFlat[]>(readFlats);
    const [name, setName] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flats));
    }, [flats]);

    const save = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const entry = {name: trimmed, inputs: {...inputs}, savedAt: new Date().toISOString()};
        // Same name overwrites, so you can update a flat after a viewing.
        setFlats((prev) => [...prev.filter((f) => f.name !== trimmed), entry]);
    };

    const share = async () => {
        const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(encodeInputs(inputs))}${window.location.hash}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            window.prompt(t('scenarios.share'), url);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{mt: 3, p: 2, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: '#ffffff'}}>
            <Typography variant="subtitle1" component="h2" sx={{fontWeight: 700, mb: 1.5}}>
                {t('scenarios.title')}
            </Typography>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5}}>
                <TextField
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                    placeholder={t('scenarios.name_placeholder')}
                    sx={{flex: '1 1 200px'}}
                />
                <Button variant="contained" onClick={save} disabled={!name.trim()} disableElevation>
                    {t('scenarios.save')}
                </Button>
                <Button variant="outlined" onClick={share}>
                    {copied ? t('scenarios.copied') : t('scenarios.share')}
                </Button>
            </Box>
            {flats.length === 0 ? (
                <Typography variant="body2" sx={{color: '#6b7280'}}>{t('scenarios.empty')}</Typography>
            ) : (
                <Box sx={{overflowX: 'auto'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('scenarios.flat')}</TableCell>
                                <TableCell align="right">{t('scenarios.monthly')}</TableCell>
                                <TableCell align="right">{t('scenarios.lost')}</TableCell>
                                <TableCell align="right">{t('scenarios.verdict')}</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flats.map((f) => {
                                const r = calculateSimulation(f.inputs);
                                return (
                                    <TableRow key={f.name} hover>
                                        <TableCell sx={{fontWeight: 600}}>{f.name}</TableCell>
                                        <TableCell align="right">{format(-r.monthlyCashFlow, 'currency')}</TableCell>
                                        <TableCell align="right" sx={{color: '#b91c1c'}}>{format(r.totalCashLost, 'currency')}</TableCell>
                                        <TableCell align="right" sx={{color: r.buyVsInvest >= 0 ? '#15803d' : '#b91c1c', fontWeight: 600}}>
                                            {format(r.buyVsInvest, 'currency')}
                                        </TableCell>
                                        <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>
                                            <Button size="small" onClick={() => onLoad(f.inputs)}>{t('scenarios.load')}</Button>
                                            <Tooltip title={t('scenarios.delete')}>
                                                <IconButton size="small" aria-label={t('scenarios.delete')}
                                                            onClick={() => setFlats((prev) => prev.filter((x) => x.name !== f.name))}>
                                                    <DeleteOutlineIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}
            <Typography variant="caption" sx={{color: '#9ca3af', display: 'block', mt: 1}}>{t('scenarios.note')}</Typography>
        </Box>
    );
};
