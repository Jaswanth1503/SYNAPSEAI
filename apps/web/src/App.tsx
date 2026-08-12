import { RouterProvider } from 'react-router-dom';
import { router } from './routes/app.routes';

export default function App() {
  return <RouterProvider router={router} />;
}
