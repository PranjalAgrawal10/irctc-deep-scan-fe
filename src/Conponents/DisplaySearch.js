import React from 'react';
import TrainCard from './TrainCard';
import Container from 'react-bootstrap/Container';
import LoadingSpinner from './LoadingSpinner';

export function DisplaySearch({trainInfo, QuotaCode, DepartureDate, displayLoding, isSearchPage }){
    
    return(
        < >
            {displayLoding ? <LoadingSpinner/> : <></>}
            { isSearchPage ? 
                trainInfo.trainBtwnStnsList.map( (train, index) => (
                    <TrainCard key={train.trainNumber + "" + index} train={train} QuotaCode={QuotaCode} DepartureDate={DepartureDate} isNewRequest={true}/>
                )) :
                <></>
            }  
        </>
    )
}


