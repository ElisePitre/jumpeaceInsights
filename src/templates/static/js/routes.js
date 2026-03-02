import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Help from './components/Help';

export default (
  <HashRouter>
    <div>
      <Route exact path='/' component={Home} />
      <Route path='/about' component={About} />
      <Route path='/help' component={Help} />
    </div>
  </HashRouter>
);