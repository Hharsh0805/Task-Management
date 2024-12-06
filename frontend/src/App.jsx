import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import TaskManager from './components/TaskManager/TaskManager';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskManager />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
