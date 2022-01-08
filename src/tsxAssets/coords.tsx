import React from 'react';

interface CoordsProps {
  notFlipped: boolean
}

function Coords(props: CoordsProps) {
  return <div id="coord-wrapper">
    <div className={`coords ranks${(props.notFlipped) ? '' : ' black'}`}>
      <p>1</p>
      <p>2</p>
      <p>3</p>
      <p>4</p>
      <p>5</p>
      <p>6</p>
      <p>7</p>
      <p>8</p>
    </div>
    <div className={`coords files${(props.notFlipped) ? '' : ' black'}`}>
      <p>a</p>
      <p>b</p>
      <p>c</p>
      <p>d</p>
      <p>e</p>
      <p>f</p>
      <p>g</p>
      <p>h</p>
    </div>
  </div>
}

export default Coords