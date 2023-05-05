import React from 'react';

const ToggleMenu = (props: { children: React.ReactNode }) => {
  return <div className='toggleMenu'>
    {props.children}
  </div>
}

export default ToggleMenu