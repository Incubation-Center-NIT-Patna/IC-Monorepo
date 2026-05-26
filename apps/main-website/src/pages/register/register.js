import React, { useState } from 'react'
import './register.css'
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
const Login=()=>{

    const navigate=useNavigate();
    const [input,setinput]=useState({
        name: "",
        email : "",
        password: ""
    })
    const handleSubmit=(e)=>{
        e.preventDefault();
        localStorage.setItem("user",JSON.stringify(input));
        navigate("/login");
    }
    return (
       <>
          <div className="background">
           
            </div>
            <form onSubmit={handleSubmit}>
                <h3>Signup Here</h3>

                <label htmlFor="username">Username</label>
                <input type="text"name="name" value={input.value} onChange={(e)=>setinput({
                    ...input,[e.target.name]: e.target.value,
                })} placeholder="Name" id="username" />
                <label htmlFor="email">Email</label>
                    <input type="text"name="email" value={input.value} onChange={(e)=>setinput({
                    ...input,[e.target.name]: e.target.value,
                })} placeholder="Email " id="email" />

                <label htmlFor="password">Password</label>
                <input type="password" name="password" value={input.value} onChange={(e)=>setinput({
                    ...input,[e.target.name]: e.target.value,
                })} placeholder="Password" id="password" />

                <button type="submit">SignIn</button>
                <div className="social">
                   
                </div>
            </form>
       </>
      
    )
}
export default Login;