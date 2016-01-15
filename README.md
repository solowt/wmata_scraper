#DC TRAINS

##[Hosted on Heroku](https://infinite-spire-8251.herokuapp.com/)

##Installation:

*  Clone this repo.
*  Run `npm install`.
*  Run `node index.js` / `nodemon`.
*  Go to localhost:3000.
*  You will need to supply [your own api key for wmata](https://developer.wmata.com/).  This should be set as either as a process variable `process.env.KEY` or in a js file called env exporting a js object like this  `modules.exports = {KEY: "your key here"}`.

##How to Use

*  Click a line link to populate data.
*  The middle div shows general information about the line you've selected and alerts if there are any.
*  The left div displays all incoming trains to the station that you select (by clicking on it).
*  The right div shows the path between two stations.  Click two stations to see a time estimate and a distance estimate between them.
*  Data updates every 10 seconds.

##Train Estimates

*  All estimates are based on wmata's api.
*  The trains rendered on the screen are estimates and the lines are not to scale.  
*  Train movement is for visual effect only.

##Technologies

*  Node/Express/Angular/Mongoose/many Node packages (see package.json).
*  No DB currently attached. Currently there is no data that I wanted to store.
