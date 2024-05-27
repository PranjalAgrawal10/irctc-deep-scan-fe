import React, {useState} from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';



export default function DeepScanGraph({deepScanResponse}) {

    var length = Object.keys(deepScanResponse.stationList).length -1;

    return (
        <>
            {
                deepScanResponse.availResponses.map((x, index) => {
                    return (
                        <ProgressBar key={index} className='m-2'>
                            <ProgressBar variant="light" now={deepScanResponse.stationList[x.from] *100 /length} key={1}></ ProgressBar >
                            <div 
                                role="progressbar" 
                                class="progress-bar bg-success d-flex justify-content-between flex-row px-2" 
                                aria-valuenow="20" 
                                aria-valuemin="0" 
                                aria-valuemax="100" 
                                style={{width: `${(deepScanResponse.stationList[x.to] - deepScanResponse.stationList[x.from]) *100/length}%` }}
                            >
                                <div className=''> {x.from} </div>
                                <div className=''> {"₹  " + x.totalCollectibleAmount} </div>
                                <div className=''> {x.to} </div>
                            </div>
                            {/* <ProgressBar variant="info" now={20} key={2} label="bpl">  </ProgressBar> */}
                        </ProgressBar>
                    )
                })
            }
            
        </>
        
    );

}