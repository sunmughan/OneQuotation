import { Box, Button, Container } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    GetApp as DownloadIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import QuotationTemplate from '../components/templates/QuotationTemplate';
const QuotationDownload = () => {
    let params = useParams()
    const quotationId = params.quotationId;

    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

    const [quotations, setQuotations] = useState([]);
    useEffect(() => {
        const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
        setQuotations(savedQuotations);
    }, []);
    return (
        <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
            <Box
                sx={{ display: 'flex', justifyContent: 'end' }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toPDF()}>Download PDF
                    <DownloadIcon fontSize={"medium"} />

                </Button>
            </Box>
            {quotations[0] &&
                <Box ref={targetRef} sx={{ padding: 5 }}>
                    <QuotationTemplate quotation={quotations.find((quot) => quot.id == quotationId)} />
                </Box>
            }
        </Container>
    )
}

export default QuotationDownload