import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import VideoPage from './pages/videoPage.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Context from './socketContext/context.jsx';
import Landing from './pages/Landing.jsx';
const router=createBrowserRouter([
  {
    path:'/',
    element:<Landing/>,
  },
  {
    path:'/call/:id',
    element:<VideoPage/>,
  }
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Context>
    <RouterProvider router={router}/>
    </Context>
  </React.StrictMode>,
)
