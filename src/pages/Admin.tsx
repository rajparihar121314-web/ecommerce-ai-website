import React from "react";

const Admin = () => {
  return (
    <div className="container mx-auto px-6 py-10 text-white">

      <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>
      <p className="mb-8">Manage your store, products and orders.</p>

      {/* ORDER MANAGEMENT */}
      <h2 className="text-2xl font-semibold mb-4">Order Management</h2>

      <p className="mb-6">
        Order Management where we can set the delivery status for customers.
      </p>

      <div className="bg-gray-900 p-4 rounded">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b border-gray-700">
              <td className="py-2">#ORD123</td>
              <td>Rahul Sharma</td>
              <td>₹35,996</td>
              <td>
                <select className="bg-gray-800 p-1 rounded">
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </td>
            </tr>

            <tr>
              <td className="py-2">#ORD124</td>
              <td>Ashok Kumar</td>
              <td>₹17,998</td>
              <td>
                <select className="bg-gray-800 p-1 rounded">
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Admin;