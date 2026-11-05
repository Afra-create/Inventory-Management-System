import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar(props) {
  const [search, setSearch] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserName(u.name || '');
      } catch (e) {
        setUserName('');
      }
    } else {
      setUserName('');
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuth();
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg tr_color">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/">{props.title}</NavLink>
              </li>
              {isLoggedIn && (
                <li className="nav-item">
                  <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/products">Products</NavLink>
                </li>
              )}
              <li className="nav-item">
                <NavLink className="nav-link active text-white fs-4" aria-current="page" to="/about">About</NavLink>
              </li>
            </ul>

            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                <form className="d-flex" role="search" onSubmit={handleSearch}>
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Search my inventory"
                    aria-label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-primary fs-5" type="submit">Search</button>
                </form>
                {userName && (
                  <span className="text-white fs-5 fw-bold text-nowrap">
                    👤 {userName}
                  </span>
                )}
                <button onClick={handleLogout} className="btn btn-outline-light fs-5 text-nowrap">
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <NavLink to="/login" className="btn btn-outline-light fs-5">
                  Sign In
                </NavLink>
                <NavLink to="/register" className="btn btn-light fs-5">
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
