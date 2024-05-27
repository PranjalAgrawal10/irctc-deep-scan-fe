import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'
import 'react-toastify/dist/ReactToastify.css';
import DeepScanGraph from './DeepScanGraph';
import { ToastContainer, toast } from 'react-toastify';

import DeepScan from './DeepScan';


export default function TrainCard({ train}){

    const [availCalls, setAvailCalls] = useState({});
    const [displayLoding, setDisplayLoding] = useState(false)
    const [AvailRequested, setAvailRequested] = useState(false)
    const [routeList, setRouteList] = useState({});
    const [showModal, setShowModal] = useState(false);

    const [showCount, setShowCount] = useState(false);
    const [isDisplayRoute, setIsDisplayRoute] = useState(false);
    const [displayDeepScanButton, setDisplayDeepScanButton] = useState(true);
    const [showDeepScan, setShowDeepScan] = useState(false);
    const [disableButton, setDisableButton] = useState(false);

    const [deepScanResponse, setDeepScanResponse] = useState({});


    const handleClose = () => setShowModal(false);


    const handleCheckAvailavility = async (train) => {
        // e.preventDefault();

        try{
            setDisplayLoding(true);
            setAvailRequested(true);
            const result = await axios.post(
                'https://localhost:44328/AvailApi/Avail',  
                {
                    quotaCode : train.quotaCode,
                    trainNumber : train.trainNumber,
                    fromStnCode : train.fromStnCode,
                    toStnCode : train.toStnCode,
                    journeyDate : train.DepartureDate,
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
            const d = new Date(train.DepartureDate);
            const dString = d.toISOString().split('T')[0].replace(`-`, ``).replace(`-`, ``);
            setShowModal(true)
            setIsDisplayRoute(false)
            const result = await axios.get(
                `https://localhost:44328/AvailApi/GetStations?TrainNumber=${train.trainNumber}&JourneyDate=${dString}&FromStnCode=${train.fromStnCode}`,  
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
                    index: parseInt(result.data.stationList[i].stnSerialNumber),
                    stationCode: result.data.stationList[i].stationCode
                }, label: `${result.data.stationList[i].stationName} (${result.data.stationList[i].stationCode}) - ${result.data.stationList[i].arrivalTime}` })
            }
            setRouteList(betweenStations);

        }catch(e){
            setShowModal(false);
        }
    }


    const deepSearch = async () => {
        if(!AvailRequested){
            toast.error("Check Availability First");
            return;
        }


        try{
            setDisableButton(true);
            setDisplayDeepScanButton(false);

            var payload = {
                quotaCode : train.quotaCode,
                trainNumber : train.trainNumber,
                fromStnCode : train.fromStnCode,
                toStnCode : train.toStnCode,
                journeyDate : train.DepartureDate,
                classCode : train.avlClasses,
            }

            const result = await axios.post(
                'https://localhost:44328/AvailApi/DeepScan',  
                payload, 
                { 
                    'accept': 'text/plain',  
                    'Content-Type': 'application/json' 
                }
            );
            
            handleClose(false);
            setDeepScanResponse(result.data);
            setShowDeepScan(true);
            setDisplayDeepScanButton(false);
            setAvailRequested(true);
            setDisableButton(false)
            console.log(result.data)
            setShowCount(true);
        } catch (error) {
            setDisableButton(true);
            console.error('Error posting data', error);
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
                    <Button 
                        variant="danger" 
                        onClick={() => deepSearch()} 
                        disabled={!displayDeepScanButton || disableButton}> 
                        {disableButton ? <LoadingSpinner/>: "Deep Search"}
                    </Button>
                    </ButtonGroup >
                    {showCount ? <p>{deepScanResponse.numberOfReQuestsHit} routes checked</p> : <></>}
                    </div>
                    
                    
                </div>

                {/* <DeepScan 
                    key={train.trainNumber} 
                    train={train} 
                    showModal={showModal} 
                    isDisplayRoute={isDisplayRoute} 
                    routeList={routeList} 
                    handleClose={handleClose} 
                    setDeepScanResponse={setDeepScanResponse}
                    setShowDeepScan={setShowDeepScan}
                    setDisplayDeepScanButton={setDisplayDeepScanButton}
                    setAvailRequested={setAvailRequested}
                /> */}
                
            </Card.Body>

            {showDeepScan ? <DeepScanGraph deepScanResponse={deepScanResponse} /> : <></>}

            <ToastContainer />

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