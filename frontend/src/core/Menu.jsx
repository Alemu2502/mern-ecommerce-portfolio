import React, { Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signout, isAuthenticated } from "../auth";
import { itemTotal } from "./cartHelpers";

const isActive = (location, path) => {
    if (location.pathname === path) {
        return { color: "#ff9900" };
    } else {
        return { color: "#ffffff" };
    }
};

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div>
            <ul className="nav nav-tabs bg-primary">
                <li className="nav-item">
                    <Link className="nav-link" style={isActive(location, "/")} to="/">
                        Home
                    </Link>
                </li>

                {isAuthenticated() && isAuthenticated().user.role === 1 && (
                    <li className="nav-item">
                        <Link className="nav-link" style={isActive(location, "/shop")} to="/shop">
                            Shop
                        </Link>
                    </li>
                )}

                <li className="nav-item">
                    <Link className="nav-link" style={isActive(location, "/cart")} to="/cart">
                        Cart{" "}
                        <sup>
                            <small className="cart-badge">{itemTotal()}</small>
                        </sup>
                    </Link>
                </li>

                {isAuthenticated() && isAuthenticated().user.role === 0 && (
                    <li className="nav-item">
                        <Link className="nav-link" style={isActive(location, "/user/dashboard")} to="/user/dashboard">
                            Dashboard
                        </Link>
                    </li>
                )}

                {isAuthenticated() && isAuthenticated().user.role === 1 && (
                    <li className="nav-item">
                        <Link className="nav-link" style={isActive(location, "/admin/dashboard")} to="/admin/dashboard">
                            Dashboard
                        </Link>
                    </li>
                )}

                {!isAuthenticated() && (
                    <Fragment>
                        <li className="nav-item">
                            <Link className="nav-link" style={isActive(location, "/signin")} to="/signin">
                                Signin
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" style={isActive(location, "/signup")} to="/signup">
                                Signup
                            </Link>
                        </li>
                    </Fragment>
                )}

                {isAuthenticated() && (
                    <li className="nav-item">
                        <span
                            className="nav-link"
                            style={{ cursor: "pointer", color: "#ffffff" }}
                            onClick={() =>
                                signout(() => {
                                    navigate("/");
                                })
                            }
                        >
                            Signout
                        </span>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Menu;
