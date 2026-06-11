import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { CafeProvider } from './app/providers/CafeProvider';
import { router } from './app/router';
import { PageLoader } from './components/feedback/PageLoader';

function App() {
  return (
    <CafeProvider>
      <RouterProvider router={router} fallbackElement={<PageLoader />} future={{ v7_startTransition: true }} />
    </CafeProvider>
  );
}

export default App;
