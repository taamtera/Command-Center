import { useState } from 'react';
import CustomAppBar from './components/CustomAppBar';
import MainContent from './components/MainContent';

const App = () => {
  // State for drawer visibility
  const [drawersVisible, setDrawersVisible] = useState(false);

  // Handler to toggle all drawers
  const handleToggleDrawers = () => {
    setDrawersVisible((v) => !v);
  };

  return (
    <div style={{ display: 'flex', background: '#181a2a', height: '100vh' }}>
      <CustomAppBar drawersVisible={drawersVisible} onToggleDrawers={handleToggleDrawers} />
      <MainContent drawersVisible={drawersVisible} setDrawersVisible={setDrawersVisible} />
    </div>
  );
};

export default App;
