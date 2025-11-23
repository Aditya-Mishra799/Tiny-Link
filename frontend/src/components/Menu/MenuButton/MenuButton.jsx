import React from 'react'
import { Menu, X } from "lucide-react"
import styles  from "./MenuButton.module.css"

const MenuButton = ({ open, setOpen }) => {
    return (
        <button onClick={() => setOpen(prev => !prev)} className={styles.menuButton}>{open ? <Menu /> : <X />}</button>
    )
}

export default MenuButton