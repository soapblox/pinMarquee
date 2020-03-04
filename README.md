# pinMarquee

Currently integrates with Challonge.com to create a "ESPN style" marquee.

Implements THREE Widgets that can be used as Browser Sources in OBS.

1. Player Widget - Scrolls through each player in the tournamnet, displaying their stats
2. Active Game - Shows the current games being played
3. Event - Dispalys the changes of the tournament

# Requirements

Install Node.js.  This will install NPM.

Probalby easiest to clone the GitHub repo.

Once Node.js and NPM is installed, go to directory on local machine.

Run "npm update".

Once dependencies are fetched...

Run "node ."

Default port is 3000.

Go to http://localhost:3000/panel

Find widgets at:

http://localhost:3000/activeGameWidget

http://localhost:3000/eventWidget

http://localhost:3000/playerWidget

These will show in the panel UI.

Link those URLs above in OBS

