import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Search from './components/Search';
import SignUp from './components/SignUp';
import Help from './components/Help';

export default (
  <HashRouter>
    <div>
      <Route exact path='/' component={Home} />
      <Route path='/about' component={About} />
      <Route path='/help' component={Help} />
      <Route path='/login' component={Login} />
      <Route path='/search' component={Search} />
      <Route path='/signup' component={SignUp} />
    </div>
  </HashRouter>
);
