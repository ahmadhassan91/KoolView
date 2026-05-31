import { useContext } from 'react';
import { KoolViewDataContext } from './koolViewDataContextCore';

export const useKoolViewData = () => {
  const context = useContext(KoolViewDataContext);
  if (!context) throw new Error('useKoolViewData must be used inside KoolViewDataProvider');
  return context;
};
