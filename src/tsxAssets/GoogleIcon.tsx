interface GoogleIconProps {
  name: string,
  aria?: boolean,
  type?: string
}

function GoogleIcon(props: GoogleIconProps) {
  let presentation: Record<string, string> = {};
  if (!props.aria) {
    presentation['aria-hidden'] = 'true'
    presentation['role'] = 'presentation'
  }

  let type = props.type || 'material-symbols-rounded';

  return (
    <span className={type} {...presentation}>
      {props.name}
    </span>
  )
}

export default GoogleIcon
