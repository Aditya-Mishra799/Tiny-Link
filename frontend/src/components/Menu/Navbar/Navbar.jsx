// a responsive nave bar component along with menu items to login, signup, logout if user is logged in, dashboard, add a new link to shorten etc
import React, { useState } from 'react';
import { Link } from 'lucide-react';
import styles from './Navbar.module.css';
import { useUserContext } from '../../../context/userContext';
import NavItem from '../NavItem/NavItem';

export const Navbar = () => {
    const { user } = useUserContext()
    const links = [
        {
            label: "Home",
            link: "/home",
            visible: true,
        },
        {
            label: "Login",
            link: "/login",
            visible: true,
        },
        {
            label: "Sign Up",
            link: "/signup",
            visible: true,
        },
        {
            label: "Dashboard",
            link: "/dashboard",
            visible: true,
        },
    ]
    return (
        <nav className={styles.navBar}>
            <div className={styles.logoCnt}>
                <Link className={styles.logo} />
                <span className={styles.logoText}>TinyLink</span>
            </div>
            <div className={styles.navLinks}>
                {
                    links.map(({ label, link, visible }) => visible && <NavItem to={link} label={label} />)
                }
            </div>
        </nav>
    )
}
