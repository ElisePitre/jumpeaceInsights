import React, { Component } from 'react';


const About = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">About</h1>
      <hr />

      <h3>Our Goal</h3>
      <p>
      Jumpeace Insights provides a historical language analysis tool that allows the user to reveal and compare linguistic patterns and biases in historical 
      newspapers. The system uses a pretrained model to investigate these patterns and provide visualizations to the user. The user is able to enter a word to 
      investigate the most closely associated terms in the corpus, and the system will then present the results using visual aids such as bar graphs and word 
      clouds.</p> 
      
      <p>
      Our team was inspired by the growing need for accessible tools that help researchers examine historical narratives at a larger scale. 
      Close reading methods can often overlook large-scale language patterns. By using a pretrained model, we will reveal these patterns across thousands of 
      historical newspapers and help users explore words that may reflect biases. Since the search term is user-defined, our application is flexible and can be 
      applied to any topic of interest. For example, a user may compare the nearest neighbours of “women” and “men” to reveal patterns that may demonstrate gender bias. The user can also select a specific date range of data to analyze. Visuals such as bar graphs and word clouds will help the user to interpret these relationships. 
      </p>

      <p>
      This tool would be mostly intended for historians, journalists, social science researchers, and students who are interested in quantitative methods to 
      complement research. By making word association patterns accessible, this application encourages engagement with historical texts and a quantitative way 
      to explore bias.
      </p>

      <h3>The Dataset</h3>
      <p> 

      Jumpeace Insights uses the{" "}
      <a
        href="https://huggingface.co/datasets/dell-research-harvard/AmericanStories"
        target="_blank"
        rel="noopener noreferrer"
       >
        American Stories Dataset
       </a>.
       American Stories consists of
       articles taken from U.S. newspapers. It contains nearly 20 million scans from the Chronicling America collection, which is maintained by the Library of 
       Congress.
      </p>
    </div>
  );
};

export default About;