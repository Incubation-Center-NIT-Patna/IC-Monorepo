import React, { useEffect, useState } from 'react'

const Loader = () => {

    const[text, setText] = useState('')
    const [showing,setShowImg] = useState(true)

    useEffect(() => {
        setTimeout(()=>{
            setShowImg(false)
            setText(
                'sdfadfadf'
            )
        }, 3000)
    },[])

  return (
    <div>
        {
            showing ? (
                <img src="./spinner.svg"/>
            ) : (
                <h3>{text}</h3>
            )
        }
    </div>
  )
}

export default Loader