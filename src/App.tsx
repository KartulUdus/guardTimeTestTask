import React from 'react';
import logo from './logo.svg';
import './App.css';
import List from './list'


function App() {
  return (
      <body className="App-body">
        <img src={logo} className="App-logo" alt="logo" />
        <List />
      </body>
  );
}

export default App;
