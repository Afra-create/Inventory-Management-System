import React, { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../config';

export default function Products() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';

    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        getProducts(searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, token]);

    const getProducts = async (query = '') => {
        if (!token) return;
        setLoading(true);
        setError("");

        try {
            const endpoint = query 
                ? `${API_URL}/products?search=${encodeURIComponent(query)}`
                : `${API_URL}/products`;

            const res = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('authChange'));
                navigate('/login');
                return;
            }

            const data = await res.json();

            if (res.status === 201) {
                console.log("Data Retrieved.");
                setProductData(data);
            }
            else {
                console.log("Something went wrong. Please try again.");
                setError(data.error || "Something went wrong. Please try again.");
                setProductData([]);
            }
        } catch (err) {
            console.log(err);
            setError(`Cannot connect to backend server at ${API_URL}. Please ensure the server is running.`);
            setProductData([]);
        } finally {
            setLoading(false);
        }
    }

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/deleteproduct/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('authChange'));
                navigate('/login');
                return;
            }

            const deletedata = await response.json();

            if (response.status === 422 || !deletedata) {
                console.log("Error");
            } else {
                console.log("Product deleted");
                getProducts(searchQuery);
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    }

    return (
        <>
            <div className='container-fluid p-5'>
                <h1>My Products Inventory</h1>
                <div className='d-flex justify-content-between align-items-center mt-3'>
                    <div className='add_button'>
                        <NavLink to="/insertproduct" className='btn btn-primary fs-5'> + Add New Product</NavLink>
                    </div>
                    {searchQuery && (
                        <div className='d-flex align-items-center gap-2'>
                            <span className='fs-5'>Results for: <strong>"{searchQuery}"</strong></span>
                            <NavLink to="/products" className='btn btn-outline-secondary btn-sm'>Clear Search</NavLink>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger mt-3 fs-5" role="alert">
                        <strong>Error: </strong> {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="overflow-auto mt-3" style={{ maxHeight: "38rem" }}>
                    <table className="table table-striped table-hover mt-3 fs-5">
                        <thead>
                            <tr className="tr_color">
                                <th scope="col">#</th>
                                <th scope="col">Product Name</th>
                                <th scope="col">Product Price</th>
                                <th scope="col">Product Barcode</th>
                                <th scope="col">Update</th>
                                <th scope="col">Delete</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                productData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted fs-5">
                                            No products found in your inventory. Click "<strong>+ Add New Product</strong>" to add one!
                                        </td>
                                    </tr>
                                ) : (
                                    productData.map((element, id) => {
                                        return (
                                            <tr key={element._id || id}>
                                                <th scope="row">{id + 1}</th>
                                                <td>{element.ProductName}</td>
                                                <td>{element.ProductPrice}</td>
                                                <td>{element.ProductBarcode}</td>

                                                <td><NavLink to={`/updateproduct/${element._id}`} className="btn btn-primary"><i className="fa-solid fa-pen-to-square"></i></NavLink></td>
                                                <td><button className="btn btn-danger" onClick={() => deleteProduct(element._id)}><i className="fa-solid fa-trash"></i></button></td>

                                            </tr>
                                        )
                                    })
                                )
                            }

                        </tbody>
                    </table>
                </div>

            </div>

        </>
    )
}
