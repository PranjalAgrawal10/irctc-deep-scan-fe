import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ButtonGroup from 'react-bootstrap/ButtonGroup'



export default function TrainCard({ train, QuotaCode, DepartureDate}){

    const [availCalls, setAvailCalls] = useState({});
    const [displayLoding, setDisplayLoding] = useState(false)
    const [AvailRequested, setAvailRequested] = useState(false)
    const [routeList, setRouteList] = useState({});
    const [isDisplayRoute, setIsDisplayRoute] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    
    const [displayDeepScanButton, setDisplayDeepScanButton] = useState(true);



    const handleChange = (selected) => {

        if(selected.length < 11){
            setSelectedOptions(selected);
        }else{
            toast.error("You can select up to 10 options only.");
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
                    quotaCode : QuotaCode.value,
                    trainNumber : train.trainNumber,
                    fromStnCode : train.fromStnCode,
                    toStnCode : train.toStnCode,
                    journeyDate : DepartureDate,
                    classCode : train.avlClasses,
                }, 
                { 
                    'accept': 'text/plain',  
                    'Content-Type': 'application/json' 
                }
            );
            setDisplayLoding(false);
            setAvailCalls(result.data);
        } catch (error) {
            setAvailRequested(false)
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

            // todo: calculate and append date and time
            var betweenStations = [];
            for(var i = 0; i < result.data.stationList.length; i++){
                betweenStations.push({ value: {
                    index: i,
                    stationCode: result.data.stationList[i].stationCode
                }, label: `${result.data.stationList[i].stationName} (${result.data.stationList[i].stationCode}) - ${result.data.stationList[i].departureTime}` })
            }
            setRouteList(betweenStations);

        }catch(e){
            setShowModal(false);
        }
    }

    return(
        <Card className='my-2'>
            <Card.Header>{train.trainNumber} - {train.trainName}</Card.Header>
            <Card.Body className='d-flex flex-column flex-lg-row flex-md-column flex-sm-column justify-content-between' >
                <Card.Text className='my-lg-auto my-md-2 my-sm-2 my-xs-2 text-center '>
                    {train.fromStnCode} | {train.departureTime} ------{train.duration}------ &nbsp;
                    {train.toStnCode}  | {train.arrivalTime}
                </Card.Text>
                <Card.Text className='my-lg-auto my-md-2 my-sm-2 my-xs-2 d-flex justify-content-center'>
                    <Row>
                        {train.avlClasses.map((cl) =>(
                            availCalls[cl] == null ? <Col key={train.trainNumber+""+cl}><Row> {cl} </Row></Col> : 
                            <AvailablityStatus 
                                key={train.trainNumber+""+cl} 
                                cl={cl} 
                                status={availCalls[cl].avlDayList[0].availablityStatus} 
                                availablityType={availCalls[cl].avlDayList[0].availablityType} 
                                setDisplayDeepScanButton={setDisplayDeepScanButton}
                            />
                        ))}
                    </Row>        
                </Card.Text>
                <div className='my-lg-auto my-md-2 my-sm-2 my-xs-2 d-flex justify-content-between '>
                    <div></div>
                    <div>
                    <ButtonGroup  >
                    <Button variant={AvailRequested ? "secondary" : "primary" } onClick={ () => (handleCheckAvailavility(train))} disabled={AvailRequested} >
                        {displayLoding ? <LoadingSpinner/> : "Check Availability"}
                    </Button>
                    <Button variant="danger" onClick={() => DisplayRoutes(train)} disabled={!displayDeepScanButton}>Deep Search</Button>

                    </ButtonGroup >

                    </div>
                    
                    
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
                                    closeMenuOnSelect={false}
                                    value={selectedOptions}
                                    onChange={handleChange}
                                    options={routeList}
                                />:
                                <LoadingSpinner />}
                            
                        </Col>
                    </Row>
                    <ToastContainer />
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


function AvailablityStatus({cl, status, availablityType, setDisplayDeepScanButton}){

    var seatStatus = "";
    var number = ""
    var statusStyle = "m-1 justify-content-center text-white font-weight-bold"
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
        setDisplayDeepScanButton(false);
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