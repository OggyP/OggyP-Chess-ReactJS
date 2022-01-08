interface ValidMoveProps {
  x: number
  y: number
  isCapture: boolean
  boxSize: number
}
function ValidMove(props: ValidMoveProps) {
  const classes = `valid-move ${(props.isCapture) ? " capture" : ""}`;
  return (
    <div className={classes} style={{ "transform": `translate(${props.x * props.boxSize}px, ${props.y * props.boxSize}px)` }}>
    </div>
  )
}

export default ValidMove