import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar(props) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get('search');
    if (q !== null) {
      setSearch(q);
    } else {
      setSearch('');
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg tr_color">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/">{props.title}</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/products">Products</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/about">About</NavLink>
              </li>
            </ul>
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary fs-5" type="submit">Search</button>
            </form>
          </div>
        </div>

      </nav>
    </div>
  )
}
