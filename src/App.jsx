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
import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-main-container">
      {currentPage === 'home' && <Page1_Home setPage={setCurrentPage} />}
      {currentPage === 'login' && <Page2_LoginPortal setPage={setCurrentPage} />}
      {currentPage === 'support' && <Page3_SupportQueue setPage={setCurrentPage} />}
      {currentPage === 'bank' && <Page4_BankLedger setPage={setCurrentPage} />}
      {currentPage === 'project' && <Page5_ProjectBoard setPage={setCurrentPage} />}
      {currentPage === 'warehouse' && <Page6_WarehouseStock setPage={setCurrentPage} />}
      {currentPage === 'invoice' && <Page7_InvoiceBilling setPage={setCurrentPage} />}
      {currentPage === 'terminal' && <Page8_SystemTerminal setPage={setCurrentPage} />}
      {currentPage === 'product' && <Page9_ProductGrid setPage={setCurrentPage} />}
      {currentPage === 'staff' && <Page10_StaffDirectory setPage={setCurrentPage} />}
      {currentPage === 'pricing' && <Page11_PricingMatrix setPage={setCurrentPage} />}
    </div>
  );
}
