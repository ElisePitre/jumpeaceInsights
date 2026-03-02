import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';

export default (
  <HashRouter>
    <div>
      <Route exact path='/' component={Home} />
      <Route path='/about' component={About} />
    </div>
  </HashRouter>
);