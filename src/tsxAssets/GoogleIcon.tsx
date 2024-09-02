interface GoogleIconProps {
  name: string,
  aria?: boolean
}

function GoogleIcon(props: GoogleIconProps) {
  let presentation:any = {};
  if (!props.aria) presentation['role'] = 'presentation';

  return (
    <span className='material-symbols-rounded' {...presentation}>
      {props.name}
    </span> 
  )
}

export default GoogleIcon