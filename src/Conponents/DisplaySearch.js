import React from 'react';
import { Container} from 'react-bootstrap';
import TrainCard from './TrainCard';


export default function DisplaySearch({trainInfo, QuotaCode, DepartureDate }){
    return(
        <Container>
            {
                trainInfo.trainBtwnStnsList.map( (train) => (
                    <TrainCard train={train} QuotaCode={QuotaCode} DepartureDate={DepartureDate} />
                )
            )}  
        </Container>
    )
}


