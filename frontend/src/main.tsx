import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ApprovedMarketingApp from '../../recovery/approved-marketing-20251214/src/App';
import '../../recovery/approved-marketing-20251214/src/index.css';
import { ProductApp } from './ProductApp';
import './product.css';

const isProductRoute = window.location.pathname === '/app' || window.location.pathname.startsWith('/app/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isProductRoute ? <ProductApp /> : <ApprovedMarketingApp />}
  </StrictMode>,
);
