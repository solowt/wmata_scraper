#DC TRAINS

![Image of Trains](appdone.png)

##[Hosted on Heroku](https://infinite-spire-8251.herokuapp.com/)

##Installation:

*  Clone this repo.
*  Run `npm install`.
*  Run `node index.js` / `nodemon`.
*  Go to localhost:3000.
*  You will need to supply [your own api key for wmata](https://developer.wmata.com/).  This should be set as either as a process variable: `process.env.KEY` or in a .js file in the root directory named env.js exporting a js object like this:  `module.exports = {KEY: "your key here"}`.

##How to Use

*  Click a line link to populate data.
*  The number on each station shows the time in minutes before the next train's arrival.  
*  Both tracks are shown, one above the station list and one below.
*  The middle div shows general information about the line you've selected and alerts if there are any.
*  The left div displays all incoming trains to the station that you select (by clicking on it).
*  The right div shows the path between two stations.  Click two stations to see a time estimate and a distance estimate between them.
*  Data updates every 10 seconds.
*  If many/all stations have N/A and no trains are rendered this is probably because wmata's api is down.  Probably.
*  Anomalies such as single tracking will likely cause problems with train prediction accuracy and train rendering.  The details of these problems are as of yet un-researched.

##Train Estimates

*  All estimates are based on wmata's api.
*  The trains rendered on the screen are estimates and the lines are not to scale.  
*  Train movement is for visual effect only (for now).

##Technologies

*  Node/Express/Angular/Mongoose/Request node packages (see package.json for full list).
*  No database currently attached. There is no data that I wanted to store.
*  Because Models were built with Mongoose schemas, a DB could easily be attached.

##Issues

I didn't understand angular as well as I thought I did going into this project, specifically how two-way data binding actually works.  Because of this I ran into problems during development using `ng-repeat` incorrectly (I treated ng-repeat like a for loop that would be executed once each time data is updated -- while this is generally how ng-repeat works, it will probably run much more often than you expect, so executing a function inside ng-repeat will have unintended consequences). I generally didn't understand how `$digest` cycles work to keep data synchronous across multiple scopes or how to use `$watch`.

Fortunately, I was able to figure these things out as I went and ended up learning a lot about angular in the process.  

One aspect of the project that isn't visible on the surface is how much effort went into making a model for the entire metro system.  I spent a lot of time constructing a large json to hold all the information about each line.  Since this is static data, I only needed to generate it once, but you could use this data to add onto the project (perhaps by persisting some data over time and looking at patterns over weeks and months).  Because all of this data has been generated and will never change (barring rail construction), I could technically disconnect the back-end entirely and simply make calls directly to the wmata api using ajax get requests with a datatype of jsonp.  The only downside of this would be the fact that I'd have to locate an api key in front end code, which is obviously not ideal.

I spent a lot of time thinking about how to determine where trains are on a line, and how to render them.  The method that I ended up using isn't perfect.  What I hoped to do was keep a trains array for each line and update it when the data updates.  However, I didn't have enough time to implement this (hopefully later!) so I ended up removing and re-rendering trains after each update.

Finally, I didn't deal with the fact that many tracks in the Metro are shared between lines.  I anticipated this issue early in the project, but I didn't get around to accounting for it.  As is, each line is handled separately so you won't see blue line trains on the yellow line, even if they share a track.

##To-do List:

*  Check for cause of ng-repeat duplicate errors when requests take a long time to repeat (may have fixed this already).
*  Persist a trains array for each rail and push/pop trains based on the data updates.  This will prevent trains "flickering."
*  Combine shared rails across different lines (Look at back end `getTrains` method, perhaps remove one if check).
*  Consider adding websockets to check for data changes before getting update.  Add to back-end first to check if this is doable with wmata's api.
*  Stop flickering highlighted stations when data refreshes.  One solution is to add an `ng-class if` statement in the line directive, adding the highlight class only if the hashed station name strings match.  However, the line directive really shouldn't be refreshing at all.  Maybe reorganize how data is updated to solve this: do I really need to added new updates to the `this.line` object in the show controller?  What about passing data in differently?  Or as a quick fix: what about having two line objects, one that gets updated and one that doesn't?  This would be redundant but would work.
*  General code cleanup, remove redundant/useless code/variables (there are a lot).
*  Add mouseover on trains to show their ETA and destination (redundant but cool).
*  Check for "ARR" - "ARR" pattern on bottom rail.  Possible bug here.
*  Look into fringe cases with bad data from wmata.  Have to think about whether or not it's worth the effort to try and correct some of their obviously incorrect data.
*  Look into rendering multiple between two given stations.  How? Change times to a two-dimensional array with each element being a sub array with 2-3 length.  Not too hard, but low priority as this mostly doesn't happen.  Also have to adjust train size/position to avoid collisions if I do this.   

See `user.stories.md` for more information about development.
