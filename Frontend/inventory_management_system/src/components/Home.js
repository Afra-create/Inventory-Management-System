import React from 'react'

export default function Home() {
  return (
    <div className='container-fluid p-5'>
      <h1 className='text-center'><b><u>Welcome to Inventory Management System</u></b></h1>

      <br />
      <br />
      <p className='text-center'>This inventory management system is a web-based application that helps businesses track and manage their inventory in real-time. It provides a centralized platform for monitoring stock levels, managing products, and generating reports. The system is built with modern technologies, including React.js for the frontend, Node.js and Express.js for the backend, and MongoDB for the database.</p>


      <br /><h2 className='text-center'>
        Click on <b><u>Products</u></b> on the navigation bar to view products, create new products, or manage existing ones.
      </h2>
    </div>
  )
}
