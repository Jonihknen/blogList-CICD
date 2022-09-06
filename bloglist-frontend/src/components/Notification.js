import React from 'react'

const Notification = ({ message }) => {
  if (message) {console.log(message.type)}
  if (message === null) {
    return null
  }
  if (message.type === 'success') {
    return (<div className='success' > {message.message} </div>)
  }
  if (message.type === 'error') {
    return (<div className='error' > {message.message} </div>)
  }
}

export default Notification