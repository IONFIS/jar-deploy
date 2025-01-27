'use client'
import { Provider } from 'react-redux';
import store from "@/app/redux/store"  // Adjust the path accordingly
import Hom from '@/Components/Hom';  // Adjust the path accordingly

const App = () => {
  return (
    <Provider store={store}>
      <Hom />
    </Provider>

  );
};

export default App;
