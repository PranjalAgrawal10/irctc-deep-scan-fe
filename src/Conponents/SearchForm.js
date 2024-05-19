import React, { useState } from 'react';
import {Row, Col, Button, Container, Form } from "react-bootstrap";
import Select from "react-select";
import axios from 'axios';
import DisplaySearch from './DisplaySearch';


export default function SearchForm() {

    const StationOptions = [
        { value: 'BPL', label: 'Bhopal JN - BPL' },
        { value: 'PUNE', label: 'PUNE JN - PUNE' },
        { value: 'NSDL', label: 'New Delhi - NSDL' },
        { value: 'INDB', label: 'Indore JN BG - INDB' }
    ]
    const QuotaOptions = [
        { value: 'GN', label: 'General' },
        { value: 'TQ', label: 'Tatkal' }
    ]

    const [response, setResponse] = useState(null);
    const [isSearchPage, setIsSearchPage] = useState(false);

    
    const [fromCode, setfromCode] = useState("");
    const [ToCode, setToCode] = useState("");
    const [DepartureDate, setDepartureDate] = useState("");
    const [QuotaCode, setQuotaCode] = useState({ value: 'GN', label: 'General' });



    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log({                    SrcStn : fromCode.value,
        //     DestStn : ToCode.value,
        //     JrnyDate : DepartureDate,
        //     QuotaCode : QuotaCode.value})
        try {
            const result = await axios.post(
                'https://localhost:7295/IrctcSearch',  
                {
                    SrcStn : fromCode.value,
                    DestStn : ToCode.value,
                    JrnyDate : DepartureDate,
                    QuotaCode : QuotaCode.value
                }, 
                { 
                    'accept': 'text/plain',  
                    'Content-Type': 'application/json' 
                }
            );
            result.data.trainBtwnStnsList =  result.data.trainBtwnStnsList.sort(function(a, b){
                const timeA = a.departureTime.split(':').map(Number);
                const timeB = b.departureTime.split(':').map(Number);
                return timeA[0] - timeB[0] || timeA[1] - timeB[1];
            });
            setResponse(result.data);
            setIsSearchPage(true);
            // console.log(result.data)
        } catch (error) {
            console.error('Error posting data', error);
        }
    };
    

    return (
        <>
            <Container>
                <Form onSubmit={handleSubmit}>
                    {
                        isSearchPage ? 
                        <Row className='d-flex flex-row' md={5} sm={5} lg={5}>
                            <FromTo fromCode={fromCode} ToCode={ToCode} StationOptions={StationOptions} setfromCode={setfromCode} setToCode={setToCode}/>
                            <DateQuota DepartureDate={DepartureDate} setDepartureDate={setDepartureDate} QuotaCode={QuotaCode} QuotaOptions={QuotaOptions} setQuotaCode={setQuotaCode}/>
                            <div className='d-flex flex-column'>
                                <Form.Label>  &nbsp; </Form.Label>
                                <Button type="submit">Search</Button>
                            </div>
                        </Row> :
                        <div>
                            <Row xs={2} sm={6} md={12} lg={16} className="justify-content-center my-3" style={{width:"100%"}}>
                                <FromTo fromCode={fromCode} ToCode={ToCode} StationOptions={StationOptions} setfromCode={setfromCode} setToCode={setToCode}/>
                            </Row >
                            <Row xs={2} sm={6} md={12} lg={16} style={{width:"100%"}} className="justify-content-center my-3">
                                <DateQuota DepartureDate={DepartureDate} setDepartureDate={setDepartureDate} QuotaCode={QuotaCode} QuotaOptions={QuotaOptions} setQuotaCode={setQuotaCode}/>
                            </Row>
                            <Row xs={1} sm={3} md={6} lg={8} style={{width:"100%"}} className="justify-content-center my-3">
                                <Button type="submit">Search</Button>
                            </Row>
                        </div> 
                    }
                </Form>

            </Container>
            {isSearchPage ?  <DisplaySearch trainInfo={response} QuotaCode={QuotaCode} DepartureDate={DepartureDate}/> : <></> }
        </>
    );
}


function FromTo({fromCode, ToCode, StationOptions, setfromCode, setToCode}){
    return( 
        <>
            <Col>
                <Form.Label> From </Form.Label>
                <Select defaultValue={fromCode} options={StationOptions} id="from-station"  onChange={(e) => (setfromCode(e))}/>
            </Col>
            <Col>
                <Form.Label> To </Form.Label>
                <Select defaultValue={ToCode}  options={StationOptions} id="to-station" onChange={(e) => (setToCode(e))}/>
            </Col>
        </>
    )
}



function DateQuota({DepartureDate, setDepartureDate, QuotaCode, QuotaOptions, setQuotaCode}){
    return (
        <>
            <Col>
                <Form.Label>Departure Date</Form.Label> 
                <Form.Control type="date" value={DepartureDate} style={{width:"100%"} } onChange={(e) => (setDepartureDate(e.target.value))}/>
            </Col>
            <Col>
                <Form.Label> Quota </Form.Label>
                <Select defaultValue={QuotaCode} options={QuotaOptions}  onChange={(e) => (setQuotaCode(e))} />
            </Col>
        </>
    )
}