import React, { useState } from 'react';
import URLShortener from '../../components/URLShortener/URLShortener';
import URLsTable from '../../components/URLsTable/URLsTable';
import styles from './Home.module.css';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleURLAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      <URLShortener onURLAdded={handleURLAdded} />
      <URLsTable refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Home;