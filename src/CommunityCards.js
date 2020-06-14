import React from 'react';

export default function CommunityCards(props) {
    let briscola = props.gameData.gameData.G.briscola;
    return (
        <div className='briscola'>
        <img src={briscola.imagePath} alt={briscola.alt} key={briscola.alt} />
        </div>
    );
}