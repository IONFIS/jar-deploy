'use client'
import { Provider } from 'react-redux';
import store from "@/app/redux/store" 
import Hom from '@/Components/Hom';  

const App = () => {
  return (
    <Provider store={store}>
      <Hom />
    </Provider>

  );
};

export default App;
 