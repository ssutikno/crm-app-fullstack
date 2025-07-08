import React, { useState, useEffect } from 'react';

function CustomerTable() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchCustomers = () => {
        setLoading(true);
        fetch(`${apiUrl}/api/customers`)
            .then(response => response.json())
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("There was an error fetching the customers!", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCustomers();
    }, [apiUrl]);

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`${apiUrl}/api/customers/${customerId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchCustomers();
                } else {
                    console.error('Failed to delete customer');
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    if (loading) {
        return <p>Loading customers...</p>;
    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Company</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <div className="pl-3">
                                    <div className="text-base font-semibold">{customer.name}</div>
                                    <div className="font-normal text-gray-500">{customer.email}</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">{customer.company}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${customer.status === 'Aktif' ? 'bg-green-500' : 'bg-red-500'}`}></div> {customer.status}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                <a href="#" onClick={() => handleDelete(customer.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline ml-4">Delete</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerTable;