import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const activeBox = useRef();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('/dashboard');
    
    const items = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                </svg>
            )
        },
        {
            label: 'Query',
            path: '/tables',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                </svg>
            )
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            )
        },
    ];

    useEffect(() => {
        // Set active item based on current location
        setActiveItem(location.pathname);
        
        // Initialize after a small delay to ensure DOM is ready
        setTimeout(() => {
            updateActiveBox(location.pathname);
        }, 100);
        
        window.addEventListener('resize', () => updateActiveBox(activeItem));
        
        return () => {
            window.removeEventListener('resize', () => updateActiveBox(activeItem));
        };
    }, [location.pathname]);

    const updateActiveBox = (path) => {
        const activeElement = document.querySelector(`[data-path="${path}"]`);
        if (activeElement && activeBox.current) {
            activeBox.current.style.top = activeElement.offsetTop + 'px';
            activeBox.current.style.left = activeElement.offsetLeft + 'px';
            activeBox.current.style.width = activeElement.offsetWidth + 'px';
            activeBox.current.style.height = activeElement.offsetHeight + 'px';
            activeBox.current.style.opacity = '1';
        }
    };

    const handleItemClick = (path) => {
        setActiveItem(path);
        navigate(path);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 min-h-screen w-64 rounded-2xl m-2 p-4 flex flex-col shadow-lg">
            <div className="mb-8">
                <div className="flex items-center gap-3 px-2 py-4">
                    <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2 rounded-xl shadow-md">
                        <img
                            src="logo.avif" 
                            alt="DMS CP"
                            width={24}
                            height={24}
                            className="rounded-sm"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-wide">DMS CP</h1>
                </div>
                <div className="border-b border-zinc-700 mt-2"></div>
            </div>

            <div className="flex-1 relative">
                <div className="space-y-2">
                    {items.map(({ label, path, icon }) => (
                        <div 
                            key={path}
                            data-path={path}
                            className={`flex items-center gap-3 pl-4 pr-6 py-3 cursor-pointer transition-all duration-200 rounded-lg ${
                                activeItem === path ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            onClick={() => handleItemClick(path)}
                        >
                            <div className="flex-shrink-0">
                                {icon}
                            </div>
                            <span className="font-medium">{label}</span>
                        </div>
                    ))}
                </div>
                
                <div
                    ref={activeBox}
                    className="absolute z-0 bg-gradient-to-r from-blue-600/20 to-sky-500/20 rounded-lg transition-all duration-300 ease-out opacity-0"
                    style={{ opacity: 0 }}
                ></div>
            </div>
            
            <div className="mt-auto border-t border-zinc-700 pt-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="font-medium">Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;