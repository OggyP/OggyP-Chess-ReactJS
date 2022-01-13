import '../css/error.scss'

interface ErrorPageProps {
  title: string
  description: string
}
function ErrorPage(props: ErrorPageProps) {
  return (
    <div className='error'>
      <h1>{props.title}</h1>
      <h3>{props.description}</h3>
      <button onClick={() => document.location.href = '/home'}>Go To OggyP Chess Home</button>
    </div>
  )
}

export default ErrorPage