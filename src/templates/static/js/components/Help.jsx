import React from 'react';
import NavBar from './NavBar';

const Help = () => {
  return (
    <div className="page-container">
      <div className="page-card">
        {/* <div className="auth-logo"> */}
        {/*   <img src="/public/images/typefaceLogo.png" alt="Tinos logo" /> */}
        {/* </div> */}

          <NavBar />

        <h2 className="page-title">Help</h2>

        <div className="page-content">
          <p>
            Here you will find tutorials on how to make use of the system&apos;s main functionality.
          </p>

          <h2 className="page-subtitle">Account Management</h2>
          <p>
            While it is possible to use the site as a guest user, certain functionality is available only to registered users. As a registered user, your 20 most recent
            searches will be saved so that you may quickly revisit them. You will also be able to download the results of your search, in the form of both graph visualizations and
            csv files.
          </p>

          <h2 className="page-subtitle-two">Creating an Account</h2>
          <p>When you first visit the site as an unregistered user, you will see the option to either log in, continue as a guest, or register a new account. To register:</p>
          <ul>
            <li>Click on the "Sign up" button</li>
            <li>Enter the specified details (email address, password, etc.)</li>
            <li>Click the "Enter" button to confirm your account's creation</li>
          </ul>

          <h2 className="page-subtitle-two">Editing Account Details</h2>

          <p>To edit your account's details, such as profile icon and password:</p>
          <ul>
            <li>Click on the image of your icon, located in the top right corner. This will take you to the account page</li>
            <li>Select the "Edit Account" button</li>
            <li>From this page, you can modify the desired field</li>
          </ul>

          <h2 className="page-subtitle-two">Deleting Your Account</h2>
          <p> You may delete your account if you wish. This will delete all stored data:</p>
          <ul>
            <li>Click on the image of your icon, located in the top right corner. This will take you to the account page</li>
            <li>Select the "Delete account" button</li>
            <li>When presented with the confirmation prompt, select "yes"</li>
          </ul>
  
          <h2 className="page-subtitle">Performing a search</h2>
          <p> As a guest user, you can perform a custom search, or select a popular search term to view the results of. As a registered user, you can view your past saved
          searches in addition to the aforementioned functions. To perform a search:</p>
          <ul>
            <li>Select the "Home" button from the navigation bar</li>
            <li>To perform a custom search, enter a term in the search bar and click "search" or press enter on your keyboard</li>
            <li>You can specify a date range to search by selecting the "date range" drop down menu under the search bar</li>
            <li>To view the results of a popular search, locate the "popular searches" list, located under the search bar, and click on one of the terms</li>
            <li>To view the results of your saved past searches, locate the "past searches" list, located under the search bar, and click on one of the term</li>
          </ul>
          
          <h2 className="page-subtitle">Downloading and Interacting with Search Results</h2>
          <p> After performing a search, you will be provided with visual representations of the data in the form on a bar graph and a word cloud. By default, the bar graph
          representation will be displayed. To toggle the visualization between the word cloud and bar graph, click the toggle icon in the top right corner of the graph. To download
          the graph, select the downwards arrow icon in the top right corner of the graph. 
          </p>
          <p>To the left of the graph, you will see a list of the most closely related terms. To download the top 100 terms in a CSV file, select the "download" button</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
