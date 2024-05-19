import React from 'react';
import TrainCard from './TrainCard';
import Container from 'react-bootstrap/Container';
import LoadingSpinner from './LoadingSpinner';

export function DisplaySearch({trainInfo, QuotaCode, DepartureDate, displayLoding, isSearchPage }){
    
    return(
        <Container >
            {displayLoding ? <LoadingSpinner/> : <></>}
            { isSearchPage ? 
                trainInfo.trainBtwnStnsList.map( (train) => (
                    <TrainCard key={train.trainNumber} train={train} QuotaCode={QuotaCode} DepartureDate={DepartureDate} isNewRequest={true}/>
                )) :
                <></>
            }  
        </Container>
    )
}


