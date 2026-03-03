import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import SignUp from './components/SignUp';

export default (
  <HashRouter>
    <div>
      <Route exact path='/' component={Home} />
      <Route path='/about' component={About} />
      <Route path='/login' component={Login} />
      <Route path='/signup' component={SignUp} />
    </div>
  </HashRouter>
);