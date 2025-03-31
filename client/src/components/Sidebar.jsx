import React, { useRef, useEffect, useState } from "react";

const Sidebar = () => {
    const lastActiveLink = useRef();
    const activeBox = useRef();
    
    const items = [
        {
          label: 'Dashboard',
          link: '#dashboard',
          className: 'nav-link active',
          ref: lastActiveLink
        },
        {
          label: 'Tables',
          link: '#tables',
          className: 'nav-link'
        },
        {
          label: 'Settings',
          link: '#settings',
          className: 'nav-link'
        },
      ];


    const initActiveBox = () => {

      activeBox.current.style.top = lastActiveLink.current.offsetTop + 'px'
      activeBox.current.style.left = lastActiveLink.current.offsetLeft + 'px'
      activeBox.current.style.width = lastActiveLink.current.offsetWidth + 'px'
      activeBox.current.style.height = lastActiveLink.current.offsetHeight + 'px'

    }
    useEffect(initActiveBox, [])
    window.addEventListener('resize', initActiveBox)
    const activeCurrentLink = (e) => {
      lastActiveLink.current?.classList.remove('active')
      e.target.classList.add('active')
      lastActiveLink.current = e.target

      activeBox.current.style.top = e.target.offsetTop + 'px'
      activeBox.current.style.left = e.target.offsetLeft + 'px'
      activeBox.current.style.width = e.target.offsetWidth + 'px'
      activeBox.current.style.height = e.target.offsetHeight + 'px'
    }

    return (
        <div className="border-zinc-500 border-1 min-h-screen max-w-full rounded-2xl m-2 p-1">
            <h1 className="text-2xl px-4 mb-8 py-2 border-1 border-zinc-500 rounded-xl m-2 flex items-center gap-4">
                <img
                 src="logo.avif" 
                 alt="user"
                 width={32}
                 height={32}
                 className="rounded-sm"
                />
                <p>DMS CP</p>
            </h1>

            {/* <div className="px-4 pt-8 flex items-center gap-4">
                <span className="material-symbols-outlined">
                    home
                </span>
                <p>Dashboard</p>
            </div>
            <div className="px-4 pt-4 flex items-center gap-4">
            <span class="material-symbols-outlined">
            menu
            </span>
                <p>Tables</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-4">
                <span className="material-symbols-outlined">
                    settings
                </span>
                <p>Settings</p>
            </div> */}

            {items.map(({ label, link, className, ref}, key) => (
                <a 
                href={link}
                className={className}
                key={key}
                ref={ref}
                onClick={activeCurrentLink}
                >
                    {label}
                </a>
            ))}
            <div
            className="active-box"
            ref={activeBox}>
            </div>
        </div>
    )
}

export default Sidebar;