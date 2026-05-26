import React, { useState, useEffect } from 'react'
import { TiDelete } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import './notice.css'
const Notice = () => {
  let dataarray = [];

  const navigate = useNavigate()
  const [input, setinput] = useState({
    content: "",
  });

  const [submittedcontent, setsubmittedcontent] = useState()
  const [notice, setnotice] = useState([
    "Hello, there will be holiday tomorrow.", "Everyone should be prsent."

  ])
  const [data, setdata] = useState([]);
  useEffect(() => {
    const storedData = localStorage.getItem("data");
    if (storedData) {
      setnotice(JSON.parse(storedData));
      setdata(JSON.parse(storedData));
    }
  }, []);
  const handleonsubmit = (e) => {
    e.preventDefault();
    console.log(e.target);
    console.log(input.content);

    const loggedin = localStorage.getItem("loggedin")
    console.log(loggedin);
    if (loggedin == "true") {
      const storedData = localStorage.getItem("data");
      let dataArray = storedData ? JSON.parse(storedData) : [];

      dataArray.push(input.content);

      localStorage.setItem("data", JSON.stringify(dataArray));


      setnotice([...notice, input.content])
      input.content = "";
    } else {
      navigate("/login")
    }
  }
  const handledelete = (itemindex) => {

    let newinput = notice.filter((item, index) => index !== itemindex)
    let newdata = data.filter((item, index) => index !== itemindex)
    localStorage.setItem("data", JSON.stringify(newdata))
    setnotice(newinput);
    setdata(newdata);
  }
  const handleInputChange = (e) => {
    setinput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };
  return (

    <div className='notice-form'>
      <Navbar/>
      <form onSubmit={handleonsubmit} className='notice-class'>
        <h1>Notice Board</h1>
        <hr></hr>
        <div className='notice-2'>

          {notice.map((item, index) => (
            <div className='inner-notice' key={index}><ul><li><div className='noti-content'>{item}</div></li></ul><div className='delete'><TiDelete onClick={() => {
              handledelete(index);
            }} /></div></div>

          ))}


        </div>
        <input type="text" value={input.content} name="content" onChange={handleInputChange}></input>
        <button type="submit" className='submit-btn'>Change</button>
        <h3>{submittedcontent}</h3>
      </form>
    </div>


  )
}
export default Notice;