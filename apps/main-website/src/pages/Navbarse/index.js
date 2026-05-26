// import React, { useEffect, useState } from 'react';
// import { TfiMenuAlt } from "react-icons/tfi";
// import { TiDelete } from "react-icons/ti";
// import "./style.css";
// import { Link } from 'react-router-dom';

// const Navbar = () => {
//   const [menu, setmenu] = useState(false);
//   const [link, setlink] = useState(false);

//   const windowset = () => {
//     if (window.innerWidth <= 957) {
//       setmenu(true);
//     } else {
//       setmenu(false);
//     }
//   }

//   useEffect(() => {
//     window.addEventListener('resize', windowset);

//     return () => {
//       window.removeEventListener('resize', windowset);
//     };
//   }, []);

//   const handleMenuClick = () => {
//     setlink(!link);
//   }

//   return (
//     <div>
//       {/* <!-- header  --> */}
//       <div className={`menu-link ${link ? '' : 'hidden'}`}>
//         <div className='one'>
//           <Link to='/'>Home</Link>
//           <a href="#about">About</a>
//           <a href="#incubations">Incubations</a>
//         </div>
//         <div className='two'>
//           <a href="#events">Events</a>
//           <a href="#gallery">Gallery</a>
//           <a href="#footer">Contact</a>
//           <Link to="/team">Team</Link>
//         </div>
//         <TiDelete className={`out `} onClick={handleMenuClick} />
//       </div>
//       <header className="header">
//         <a href="https://www.nitp.ac.in/" className="logo1"><img src="img/download-removebg-preview.png" alt="NITP_logo" /></a>
//         <div className='menu'>
//           <TfiMenuAlt className={`color ${menu ? '': 'hidden'}`} onClick={handleMenuClick} />
//         </div>
//         <nav className={`navbar ${menu ? 'hidden' : ''}`}>
//           <Link to='/'>Home</Link>
//           <a href="#about">About</a>
//           <a href="#incubations">Incubations</a>
//           <a href="#events">Events</a>
//           <a href="#gallery">Gallery</a>
//           <a href="#footer">Contact</a>
//           <Link to="/team">Team</Link>
//         </nav>
//         <a className="logo2" href="#home"><img src="img/IC LOGO (1).png" alt="Incubation Centre logo" />
//         </a>
//       </header>
//     </div>
//   );
// }

// export default Navbar;
