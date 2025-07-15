import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import AddListing from "./pages/AddListing";
import MyRentals from "./pages/MyRentals";
import Wallet from "./pages/Wallet";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow mb-6">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">Solana 租屋網</Link>
            <div className="space-x-4">
              <Link to="/listings" className="hover:text-blue-500">房源列表</Link>
              <Link to="/add-listing" className="hover:text-blue-500">上架房源</Link>
              <Link to="/my-rentals" className="hover:text-blue-500">我的租約</Link>
              <Link to="/wallet" className="hover:text-blue-500">連接錢包</Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/add-listing" element={<AddListing />} />
            <Route path="/my-rentals" element={<MyRentals />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 