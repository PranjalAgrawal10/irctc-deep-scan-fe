import React, {useState, useEffect} from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';


export default function TrainCard({train, QuotaCode, DepartureDate}){

    const [availCalls, setAvailCalls] = useState({});
    const [isAvail, setIsAvail] = useState(false);

    const handleCheckAvailavility = async (train) => {
        // e.preventDefault();
        try{
            const result = await axios.post(
                'https://localhost:7295/AvailApi',  
                {
                    QuotaCode : QuotaCode.value,
                    TrainNumber : train.trainNumber,
                    FromStnCode : train.fromStnCode,
                    ToStnCode : train.toStnCode,
                    JourneyDate : DepartureDate,
                    ClassCode : train.avlClasses,
                }, 
                { 
                    'accept': 'text/plain',  
                    'Content-Type': 'application/json' 
                }
            );
            setIsAvail(true);
            console.log(result.data);
            setAvailCalls(result.data);
            
        } catch (error) {
            console.error('Error posting data', error);
        }
    };

    return(
        <Card key={train.trainNumber}>
            <Card.Header>{train.trainNumber} - {train.trainName}</Card.Header>
            <Card.Body className='d-flex justify-content-between' >
                <Card.Text className='my-auto'>
                    {train.fromStnCode} | {train.departureTime} ------{train.duration}------ &nbsp;
                    {train.toStnCode}  | {train.arrivalTime}
                </Card.Text>
                <Card.Text className='my-auto'>
                    <Row>
                        {train.avlClasses.map((cl) =>(
                            availCalls[cl] == null ? <Col><Row> {cl} </Row></Col> : 
                            <AvailablityStatus cl={cl} status={availCalls[cl].avlDayList[0].availablityStatus} availablityType={availCalls[cl].avlDayList[0].availablityType} />
                        ))}
                    </Row>        
                </Card.Text>
                <div className='my-auto'>
                    <Button variant="primary" onClick={ () => (handleCheckAvailavility(train))} >Check Availability</Button>
                    <Button variant="danger" >Deep Search</Button>
                </div>
            </Card.Body>
        </Card>
    )
}


function AvailablityStatus({cl, status, availablityType}){

    var seatStatus = "";
    var number = ""
    var statusStyle = "mx-1 justify-content-center text-white font-weight-bold"
    //availablityType
//AVAILABLE
    if(availablityType=== '0'){
        statusStyle += " bg-danger"
        seatStatus = status
        number = "";
    }else if(availablityType=== '1'){
        statusStyle += " bg-success"
        seatStatus = "AVAILABLE"
        number = status.split("-")[1];
    }else if(availablityType=== '2'){
        statusStyle += " bg-info"
        seatStatus = "RAC";
        number = status.slice(3,status.length).trim();
    }
     else if(availablityType=== '3'){
        statusStyle += " bg-danger"
        seatStatus = status.slice(0,4);
        number = status.slice(4,status.length).trim();
    }

// GNWL67/WL32


    return (
        <Col className={statusStyle} style={{maxWidth:"120px", borderRadius:"10px"}}> 
            <Row><Col className='mx-auto text-center'>{cl}</Col></Row>
            <Row><Col className='mx-auto text-center'>{seatStatus}</Col></Row>
            <Row><Col className='mx-auto text-center'>{number}</Col></Row>
        </Col>
    )

}