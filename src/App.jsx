import React, { useState } from 'react';

import Page1_Home from './Page1_Home';
import Page2_LoginPortal from './Page2_LoginPortal';
import Page3_SupportQueue from './Page3_SupportQueue';
import Page4_BankLedger from './Page4_BankLedger';
import Page5_ProjectBoard from './Page5_ProjectBoard';
import Page6_WarehouseStock from './Page6_WarehouseStock';
import Page7_InvoiceBilling from './Page7_InvoiceBilling';
import Page8_SystemTerminal from './Page8_SystemTerminal';
import Page9_ProductGrid from './Page9_ProductGrid';
import Page10_StaffDirectory from './Page10_StaffDirectory';
import Page11_PricingMatrix from './Page11_PricingMatrix';
import Page12_Checkout from './Page12_Checkout';

import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Page1_Home setPage={setCurrentPage} />;
      case 'login':
        return <Page2_LoginPortal setPage={setCurrentPage} />;
      case 'support':
        return <Page3_SupportQueue setPage={setCurrentPage} />;
      case 'bank':
      case 'ledger':
        return <Page4_BankLedger setPage={setCurrentPage} />;
      case 'project':
      case 'projects':
        return <Page5_ProjectBoard setPage={setCurrentPage} />;
      case 'warehouse':
        return <Page6_WarehouseStock setPage={setCurrentPage} />;
      case 'invoice':
      case 'billing':
        return <Page7_InvoiceBilling setPage={setCurrentPage} />;
      case 'terminal':
        return <Page8_SystemTerminal setPage={setCurrentPage} />;
      case 'product':
      case 'catalog':
        return <Page9_ProductGrid setPage={setCurrentPage} />;
      case 'staff':
        return <Page10_StaffDirectory setPage={setCurrentPage} />;
      case 'pricing':
        return <Page11_PricingMatrix setPage={setCurrentPage} />;
      case 'checkout':
        return <Page12_Checkout setPage={setCurrentPage} />;
      default:
        return <Page1_Home setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-main-container">
      {renderPage()}
    </div>
  );
}
