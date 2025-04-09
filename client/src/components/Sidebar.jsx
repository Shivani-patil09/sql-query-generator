import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const lastActiveLink = useRef();
    const activeBox = useRef();
    const navigate = useNavigate();
    
    const items = [
        {
          label: 'Dashboard',
          path: '/dashboard',
          className: 'nav-link active',
          ref: lastActiveLink
        },
        {
          label: 'Tables',
          path: '/tables',
          className: 'nav-link'
        },
        {
          label: 'Settings',
          path: '/settings',
          className: 'nav-link'
        },
    ];

    const initActiveBox = () => {
        if (lastActiveLink.current && activeBox.current) {
            activeBox.current.style.top = lastActiveLink.current.offsetTop + 'px';
            activeBox.current.style.left = lastActiveLink.current.offsetLeft + 'px';
            activeBox.current.style.width = lastActiveLink.current.offsetWidth + 'px';
            activeBox.current.style.height = lastActiveLink.current.offsetHeight + 'px';
        }
    };

    useEffect(() => {
        initActiveBox();
        window.addEventListener('resize', initActiveBox);
        
        return () => {
            window.removeEventListener('resize', initActiveBox);
        };
    }, []);

    const handleLinkClick = (e, path) => {
        // Update active link styling
        lastActiveLink.current?.classList.remove('active');
        e.target.classList.add('active');
        lastActiveLink.current = e.target;

        // Update active box position
        if (activeBox.current) {
            activeBox.current.style.top = e.target.offsetTop + 'px';
            activeBox.current.style.left = e.target.offsetLeft + 'px';
            activeBox.current.style.width = e.target.offsetWidth + 'px';
            activeBox.current.style.height = e.target.offsetHeight + 'px';
        }

        // Navigate to the selected path
        navigate(path);
    };

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

            {items.map(({ label, path, className, ref }, key) => (
                <div 
                    key={key}
                    className={`${className} cursor-pointer px-4 py-2`}
                    ref={ref}
                    onClick={(e) => handleLinkClick(e, path)}
                >
                    {label}
                </div>
            ))}
            <div
                className="active-box"
                ref={activeBox}
            ></div>
        </div>
    );
};

export default Sidebar;