import React, { useState } from 'react';
import {Row, Col, Button, Container, Form } from "react-bootstrap";
import Select from "react-select";
import axios from 'axios';
import {DisplaySearch} from './DisplaySearch';

export default function SearchForm() {

    const [StationOptions, setStationOptions ] = useState([
        { value: 'BPL', label: 'Bhopal JN - BPL' },
        { value: 'PUNE', label: 'PUNE JN - PUNE' },
        { value: 'NSDL', label: 'New Delhi - NSDL' },
        { value: 'INDB', label: 'Indore JN BG - INDB' }
    ]);

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
    const [displayLoding, setDisplayLoding] = useState(false)


    async function handelOnInputChange(inp) {

        // console.log(inp);
        if(inp.length % 3 === 0 || inp.length === 1){
            try {
                const result = await axios.post(
                    'https://localhost:7295/Station',  
                    {
                        Name : inp
                    }, 
                    { 
                        'accept': 'text/plain',  
                        'Content-Type': 'application/json' 
                    }
                );
    
                console.log(result.data)
                setStationOptions(result.data);
                console.log(result.data)
            } catch (error) {
                console.error('Error posting data', error);
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            setDisplayLoding(true);

            // document.getElementById("result-container").innerHTML = "";
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
            setDisplayLoding(false);
            // console.log(result.data)
        } catch (error) {
            setDisplayLoding(false);
            console.error('Error posting data', error);
        }
    };
    

    return (
        <Container>
            <Container className='my-2 px-3 pt-2 pb-3 bg-secondary' style={{borderRadius: "5px"}}>
                <Form onSubmit={handleSubmit}>
                    {
                        isSearchPage ? 
                        <Row className='d-flex flex-row' md={5} sm={2} lg={5}>
                            <FromTo fromCode={fromCode} ToCode={ToCode} StationOptions={StationOptions} setfromCode={setfromCode} handelOnInputChange={handelOnInputChange} setToCode={setToCode}/>
                            <DateQuota DepartureDate={DepartureDate} setDepartureDate={setDepartureDate} QuotaCode={QuotaCode} QuotaOptions={QuotaOptions} setQuotaCode={setQuotaCode}/>
                            <div className='d-flex flex-column'>
                                <Form.Label>  &nbsp; </Form.Label>
                                <Button type="submit">Search</Button>
                            </div>
                        </Row> :
                        <Row>
                            <Row xs={2} sm={6} md={12} lg={16} className="justify-content-center my-3" style={{width:"100%"}}>
                                <FromTo fromCode={fromCode} ToCode={ToCode} StationOptions={StationOptions} setfromCode={setfromCode} handelOnInputChange={handelOnInputChange} setToCode={setToCode}/>
                            </Row >
                            <Row xs={2} sm={6} md={12} lg={16} style={{width:"100%"}} className="justify-content-center my-3">
                                <DateQuota DepartureDate={DepartureDate} setDepartureDate={setDepartureDate} QuotaCode={QuotaCode} QuotaOptions={QuotaOptions} setQuotaCode={setQuotaCode}/>
                            </Row>
                            <Row xs={1} sm={3} md={6} lg={8} style={{width:"100%"}} className="justify-content-center my-3">
                                <Button variant={!displayLoding ? "primary" : "dark"} type="submit" disabled={displayLoding}>Search</Button>
                            </Row>
                        </Row> 
                    }
                </Form>
            </Container>

            <DisplaySearch trainInfo={response} QuotaCode={QuotaCode} DepartureDate={DepartureDate} displayLoding={displayLoding} isSearchPage={isSearchPage}/>
            
        </Container>
    );
}


function FromTo({fromCode, ToCode, StationOptions, setfromCode, handelOnInputChange, setToCode}){


    return( 
        <>
            <Col>
                <Form.Label className='text-white'> From </Form.Label>
                <Select defaultValue={fromCode} options={StationOptions} id="from-station" onInputChange={(inp) => {handelOnInputChange(inp)}} onChange={(e) => (setfromCode(e))}/>
            </Col>
            <Col>
                <Form.Label className='text-white'> To </Form.Label>
                <Select defaultValue={ToCode}  options={StationOptions} id="to-station" onInputChange={(inp) => {handelOnInputChange(inp)}} onChange={(e) => (setToCode(e))}/>
            </Col>
        </>
    )
}



function DateQuota({DepartureDate, setDepartureDate, QuotaCode, QuotaOptions, setQuotaCode}){
    return (
        <>
            <Col>
                <Form.Label className='text-white'>Departure Date</Form.Label> 
                <Form.Control type="date" value={DepartureDate} style={{width:"100%"} } onChange={(e) => (setDepartureDate(e.target.value))}/>
            </Col>
            <Col>
                <Form.Label className='text-white'> Quota </Form.Label>
                <Select defaultValue={QuotaCode} options={QuotaOptions}  onChange={(e) => (setQuotaCode(e))} />
            </Col>
        </>
    )
}