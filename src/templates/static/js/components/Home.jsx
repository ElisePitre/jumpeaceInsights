import React, { Component } from 'react';
import NavBar from './NavBar';
export default class Home extends Component {
    render() {
       return (
         <div className="page-shell">
          <h1>Hello React!</h1>
          <NavBar />
         </div>
       )
    }
}
