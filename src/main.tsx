import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Get the root element
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

// Create root outside of render call
const root = ReactDOM.createRoot(rootElement)

// Wrap the entire app in StrictMode and BrowserRouter
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)