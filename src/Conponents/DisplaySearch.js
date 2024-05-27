import React from 'react';
import TrainCard from './TrainCard';
import LoadingSpinner from './LoadingSpinner';

export function DisplaySearch({trainInfo, QuotaCode, DepartureDate, displayLoding, isSearchPage }){
    
    return(
        < >
            {displayLoding ? <LoadingSpinner/> : <></>}
            { isSearchPage ? 
                trainInfo.trainBtwnStnsList.map( (train, index) => {
                    train.DepartureDate = DepartureDate;
                    train.quotaCode = QuotaCode.value;
                    return (
                    <TrainCard key={train.trainNumber + "" + index} train={train} isNewRequest={true}/>
                )}) :
                <></>
            }  
        </>
    )
}


