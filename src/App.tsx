import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import { NotificationProvider, useNotificationContext } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import WalletConnectButton from "./components/WalletConnectButton";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import AddListing from "./pages/AddListing";
import CreateListing from "./pages/CreateListing";
import MyRentals from "./pages/MyRentals";
import Wallet from "./pages/Wallet";
import WalletTest from "./pages/WalletTest";
import RentalTest from "./pages/RentalTest";

const Navigation = () => {
  return (
    <nav className="bg-white shadow mb-6">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Solana 租屋網</Link>
        <div className="flex items-center space-x-4">
          <Link to="/listings" className="hover:text-blue-500">房源列表</Link>
          <Link to="/create-listing" className="hover:text-blue-500">上架房源</Link>
          <Link to="/my-rentals" className="hover:text-blue-500">我的租約</Link>
          <Link to="/wallet" className="hover:text-blue-500">錢包頁面</Link>
          <Link to="/wallet-test" className="hover:text-blue-500">錢包測試</Link>
          <Link to="/rental-test" className="hover:text-blue-500">租用測試</Link>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { notifications, removeNotification } = useNotificationContext();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/wallet" element={<Wallet />} />
                        <Route path="/wallet-test" element={<WalletTest />} />
              <Route path="/rental-test" element={<RentalTest />} />
        </Routes>
      </div>
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
};

const App = () => {
  return (
    <WalletProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </WalletProvider>
  );
};

export default App; 