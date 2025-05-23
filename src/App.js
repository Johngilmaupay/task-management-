import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Tasks from './Tasks';
import CalendarComponent from './calendar';  // Only import the component you exported

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/calendar" element={<CalendarComponent />} />
    </Routes>
  );
}

export default App;
