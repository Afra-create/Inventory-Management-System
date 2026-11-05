import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Home() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className='container-fluid p-5 text-center'>
      <h1 className='text-center'><b><u>Welcome to Inventory Management System</u></b></h1>

      <br />
      <br />
      <p className='text-center fs-5 mx-auto' style={{ maxWidth: '850px' }}>
        This inventory management system is a secure web-based application that helps businesses and individuals track and manage their inventory in real-time. Each registered user has their own private inventory dashboard to monitor stock levels, manage products, and perform quick searches.
      </p>

      <div className="mt-5">
        {isLoggedIn ? (
          <div>
            <NavLink to="/products" className="btn btn-primary btn-lg px-4 py-2 fs-4 me-3">
              📦 Go to My Products
            </NavLink>
            <NavLink to="/insertproduct" className="btn btn-outline-primary btn-lg px-4 py-2 fs-4">
              ➕ Add New Product
            </NavLink>
          </div>
        ) : (
          <div>
            <NavLink to="/login" className="btn btn-primary btn-lg px-5 py-2 fs-4 me-3">
              Sign In
            </NavLink>
            <NavLink to="/register" className="btn btn-outline-primary btn-lg px-5 py-2 fs-4">
              Create Account
            </NavLink>
          </div>
        )}
      </div>
    </div>
  )
}
