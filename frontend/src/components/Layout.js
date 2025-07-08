import React, { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; // Import the new Navbar component
import './Layout.css';

function Layout() {
    // State to manage the sidebar's toggled status
    const [isToggled, setIsToggled] = useState(true);

    // Function to pass to the navbar button
    const handleMenuToggle = () => {
        setIsToggled(!isToggled);
    };

    return (
        // Conditionally apply the "toggled" class
        <div className={`d-flex ${isToggled ? 'toggled' : ''}`} id="wrapper">
            <Sidebar />
            <div id="page-content-wrapper">
                {/* Pass the toggle handler function to the Navbar */}
                <Navbar onMenuToggle={handleMenuToggle} />
                <main className="container-fluid p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;