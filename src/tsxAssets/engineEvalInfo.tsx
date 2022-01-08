import React, { useState } from 'react';

function EngineInfo() {
  const [info, setInfo] = useState<any>(null);

  const handleEngineOutput = (event: any) => {
    console.log(event.detail)
    setInfo(event.detail)
  };

  React.useEffect(() => {
    document.addEventListener('engine', handleEngineOutput);

    // cleanup this component
    return () => {
      document.removeEventListener('engine', handleEngineOutput);
    };
  }, []);

  if (info) {
    let evalText = ""
    if (info.score.includes("mate")) {
      if (Number(info.score.split(' ')[1]) === 0) {
        evalText = "Checkmate"
      } else {
        // console.log(parsedLineInfo.score)
        evalText = `${(info.score.split(' ')[1][0] === '-') ? '-' : '+'}M ${Math.abs(Number(info.score.split(' ')[1]))}`
      }
    } else {
      // Show in points
      if (Number(info.score.split(' ')[1]) > 0) evalText += "+"
      evalText += (Number(info.score.split(' ')[1]) / 100).toString()
    }
    if (evalText !== 'Checkmate')
      return <div className='engine-info'>
        <h3>Depth: {info.depth} | Eval: {evalText}</h3>
        <p>Nodes: {info.nodes} | Nps: {info.nps}</p>
        <h4>Moves: {(info.pv.length <= 30) ? info.pv : info.pv.slice(0, 25) + "..."}</h4>
      </div>
    else
      return <div className='engine-info'>
        <h3>Checkmate</h3>
      </div>
  }
  else
    return <div className='engine-info'>
      <h3>Loading Engine</h3>
    </div>
}

export default EngineInfo