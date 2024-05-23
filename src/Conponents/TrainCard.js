import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'
import Select from 'react-select';


export default function TrainCard({ key, train, QuotaCode, DepartureDate}){

    const [availCalls, setAvailCalls] = useState({});
    const [displayLoding, setDisplayLoding] = useState(false)
    const [AvailRequested, setAvailRequested] = useState(false)
    const [routeList, setRouteList] = useState({});
    const [isDisplayRoute, setIsDisplayRoute] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);




    const handleChange = (selected) => {
        if(selectedOptions.length < 10){
            setSelectedOptions(selected);
        }else{
            console.log("selection not allowed")
        }
      };
    


    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);



    const handleCheckAvailavility = async (train) => {
        // e.preventDefault();
        try{
            setDisplayLoding(true);
            setAvailRequested(true);
            const result = await axios.post(
                'https://localhost:7295/AvailApi/Avail',  
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
            console.log(result.data);
            setDisplayLoding(false);
            setAvailCalls(result.data);
        } catch (error) {
            setAvailRequested(true)
            setDisplayLoding(false)
            console.error('Error posting data', error);
        }
    };


    const DisplayRoutes = async (train) =>{
        if(routeList.length > 0){
            setShowModal(true);
            return;
        }
        try{
            const d = new Date(DepartureDate);
            const dString = d.toISOString().split('T')[0].replace(`-`, ``).replace(`-`, ``);

            console.log(dString.replace(`-`, ``).replace(`-`, ``))

            setShowModal(true)
            setIsDisplayRoute(false)
            const result = await axios.get(
                `https://localhost:7295/AvailApi/GetStations?TrainNumber=${train.trainNumber}&JourneyDate=${dString}&FromStnCode=${train.fromStnCode}`,  
                "", 
                { 
                    'accept': 'text/plain',  
                    'Content-Type': 'application/json' 
                }
            );
            setIsDisplayRoute(true);
            // console.log(result.data);

            var betweenStations = [];
            for(var i = 0; i < result.data.stationList.length; i++){
                betweenStations.push({ value: result.data.stationList[i].stationCode, label:result.data.stationList[i].stationName })
            }
            console.log(betweenStations);

            setRouteList(betweenStations);

        }catch(e){
            setShowModal(false);
        }
    }

    return(
        <Card key={key} className='my-2'>
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
                            <AvailablityStatus key={cl} cl={cl} status={availCalls[cl].avlDayList[0].availablityStatus} availablityType={availCalls[cl].avlDayList[0].availablityType} />
                        ))}
                    </Row>        
                </Card.Text>
                <div className='my-auto'>
                    <Button variant={AvailRequested ? "secondary" : "primary" } onClick={ () => (handleCheckAvailavility(train))} disabled={AvailRequested} >
                        {displayLoding ? <LoadingSpinner/> : "Check Availability"}
                    </Button>
                    <Button variant="danger" onClick={() => DisplayRoutes(train)}>Deep Search</Button>
                </div>

                <Modal show={showModal} onHide={handleClose} animation={false} style={{maxHeight: "80vh"}}>
                    <Modal.Header closeButton>
                        <Modal.Title className='text-center'>Select 10 stations on which you can change seats.</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Row className="justify-content-md-center">
                        <Col>
                            <Row className='justify-content-between'>
                                <Col>
                                    Select Stations
                                </Col>
                                <Col className='text-end'>
                                    Selection Left {10 - (selectedOptions.length)}
                                </Col>
                            </Row>
                            {isDisplayRoute ? 
                                <Select
                                    isMulti
                                    key={key}
                                    closeMenuOnSelect={false}
                                    value={selectedOptions}
                                    onChange={handleChange}
                                    options={routeList}
                                />:
                                <LoadingSpinner />}
                            
                        </Col>
                    </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={handleClose}>
                            Deep Scan
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Card.Body>
        </Card>
    )
}


function AvailablityStatus({key, cl, status, availablityType}){

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