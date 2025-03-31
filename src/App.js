import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/public/publication-web-resources/html/publication.html" element={<Publication />} />
    </Routes>
  );
}

export default App;