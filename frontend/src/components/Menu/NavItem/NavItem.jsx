// code for a nav item component a link to a page 
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavItem.module.css';
const NavItem = ({ to, label }) => {
    return (
        <li className={styles.navItem}>
            <NavLink to={to} activeClassName={styles.active}>
                {label}
            </NavLink>
        </li>
    );
};

export default NavItem;