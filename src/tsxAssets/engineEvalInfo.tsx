import React, { useState } from 'react';

interface PVinfo {
  score: string,
  pv: string,
}

function EngineInfo(props: {
  showMoves: boolean,
  showEval: boolean,
  mobile: boolean
}) {
  const [info, setInfo] = useState<{
    info: any,
    eval: string
  } | null>(null);
  const [PVlist, setPVlist] = useState<(PVinfo | null)[]>([]);

  React.useEffect(() => {
    const handleEngineOutput = (event: any) => {
      const data = event.detail
      if (data[0].score) {
        const PVlist: (PVinfo | null)[] = data.map((item: any, index: number) => {
          let evalText = ""
          if (item.score.includes("mate")) {
            const mateIn = item.score.split(' ')[1]
            if (mateIn === '0') {
              evalText = "Checkmate"
            }
            else {
              evalText = `${(mateIn[0] === '-') ? '-' : '+'}M ${Math.abs(Number(mateIn))}`
            }
          } else {
            if (item.raw === 'info depth 0 score cp 0') evalText = 'Stalemate'
            else {
              // Show in points
              if (Number(item.score.split(' ')[1]) > 0) evalText += "+"
              evalText += (Number(item.score.split(' ')[1]) / 100).toString()
            }
          }
          if (index === 0)
          setInfo({
            info: data[0],
            eval: evalText
          })
          if (!item.pv) return null
          return {
            score: evalText,
            pv: item.pv
          }
        })
        setPVlist(PVlist)
      }
    };

    document.addEventListener('engine', handleEngineOutput);

    // cleanup this component
    return () => {
      document.removeEventListener('engine', handleEngineOutput);
    };
  }, [PVlist]);

  if (info) {
    if (!props.mobile) {
    if (info.eval !== 'Checkmate' && info.eval !== 'Stalemate') {
      const movesList = (props.showMoves) ?
        <div id='eval-pvs'>
          <table>
            <tbody>
              {PVlist.map((item, index) => {
                if (!item) return null
                return <tr key={index} title={item.pv}>
                  <td className='eval'>{item.score}</td>
                  <td className='pv'>{(item.pv.length <= 35) ? item.pv : item.pv.slice(0, 30) + "..."}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
        : null
      return <div className='engine-info'>
        <h3>Depth: {info.info.depth}{(props.showEval) ? ' | Eval: ' + info.eval : null}</h3>
        <p>Nodes: {info.info.nodes} | Nps: {info.info.nps}</p>
        {movesList}
      </div>
    }
    else
      return <div className='engine-info'>
        <h3>{info.eval}</h3>
      </div>
    } else {
        if (info.eval !== 'Checkmate' && info.eval !== 'Stalemate') {
            const movesList = (props.showMoves && PVlist[0]) ?
            <span className='pv'>{PVlist[0].pv}</span> : null
            return <div className='engine-info'>
              <div className='mobile-engline-info'>{(props.showEval) ? <div className='eval-engine-info'><strong>Eval: {info.eval}</strong></div> : null}{(props.showEval) ? "\t\t" : null}Depth: {info.info.depth} {movesList}</div>
            </div>
          }
          else
            return <div className='engine-info'>
              <p className='mobile-engline-info'><strong>{info.eval}</strong></p>
            </div>
    }
  }
  else
    return <div className='engine-info'>
      <h3>Loading Engine</h3>
    </div>
}

export default EngineInfo