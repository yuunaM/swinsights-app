import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import wave from '../../public/wave.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const WaveAnimate = () => {
    // const [isClient, setIsClient] = useState(false);

    // useEffect(() => {
    //     setIsClient(true);
    // }, []);

    // if (!isClient) {
    //     return null;
    // }
  
    return (
        <div className='wave_wrap'>
            <Lottie animationData={wave} style={{ width: '100%', height: 'auto', position: 'absolute', bottom: '-4px' }} />
        </div>
    )
};

export default WaveAnimate;