import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LoadingSpinner from './LoadingSpinner'
import axios from 'axios';


export default function DeepScan({
    train, showModal, isDisplayRoute, routeList, setDeepScanResponse, 
    handleClose, setShowDeepScan, setDisplayDeepScanButton, setAvailRequested}){
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [disableButton, setDisableButton] = useState(false);


    const deepSearch = async () => {
        try{
            setDisableButton(true);
            var stationList = {};
            
            for (var key in selectedOptions) {
                // stationList[selectedOptions[key].value.index] = selectedOptions[key].value.stationCode ;
                stationList[selectedOptions[key].value.stationCode] = selectedOptions[key].value.index 
            }


            var payload = {
                stationList : stationList,
                    availRequest : {
                        quotaCode : train.quotaCode,
                        trainNumber : train.trainNumber,
                        fromStnCode : train.fromStnCode,
                        toStnCode : train.toStnCode,
                        journeyDate : train.DepartureDate,
                        classCode : train.avlClasses,
                    }
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
        } catch (error) {
            setDisableButton(false);
            console.error('Error posting data', error);
        }
    }




    const handleChange = (selected) => {

        if(selected.length < 11){
            setSelectedOptions(selected);
        }else{
            toast.error("You can select up to 10 options only.");
        }
    };



    return(
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
                <Button variant="danger" onClick={() => deepSearch()} disabled={disableButton}>
                    { disableButton ? <LoadingSpinner /> : "Deep Scan"}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}