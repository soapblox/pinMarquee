function interval(duration, fn) {
    this.baseline = undefined

    this.run = function(){
        if(this.baseline === undefined){
        this.baseline = new Date().getTime()
        }
        fn()
        var end = new Date().getTime()
        this.baseline += duration
    
        var nextTick = duration - (end - this.baseline)
        if(nextTick<0){
        nextTick = 0
        }
        (function(i){
            i.timer = setTimeout(function(){
            i.run(end)
        }, nextTick)
        }(this))
    }

    this.stop = function(){
        clearTimeout(this.timer)
    }
}

var gDeltaEvents = [];

class Player {
    constructor(id, name) {
        this.name = name;
        this.id = id;
        this.seed = "";
    }
}

class Match {
    constructor() {
        this.id = "";
        this.state = "";
        this.player1; // player object
        this.player2; // player object
        this.player1Score;
        this.player2Score;
        this.round;
        this.matchScore;
    }
}

class Tournament {
    constructor() {
        this.id = "";
        this.name = "";
        this.players = [];
        this.matches = [];
        this.deltaEvents = [];
    }

    getMatchesByPlayerId(pId) {
        var playerMatches = [];
        console.log(pId + " " + this.matches.length);
        for (var i = 0; i < this.matches.length; i++) {
 
            // if no players are defined, ignore
            if (typeof this.matches[i].player1 === 'undefined' && typeof this.matches[i].player2 === 'undefined') {
                //console.log("undefined players on match..");
            }
            else if (typeof this.matches[i].player1 !== 'undefined' && this.matches[i].player1.id == pId) {
                // player1 is defined and matches the playerId
                playerMatches.push(this.matches[i]);
            }
            else if (typeof this.matches[i].player2 !== 'undefined' && this.matches[i].player2.id == pId) {
                // player2 is defined and matches the playerId
                playerMatches.push(this.matches[i]);
            }
        }

        console.log(pId + " " + this.matches.length);

        return playerMatches;
    }    

    getPlayerById(pId) {
        // match doesn't know what player it is yet, so ignore...
        if (pId == null) {
           return;
       }
       //console.log(this.players.length);
       for (var i = 0; i < this.players.length; i++) {
           if (this.players[i].id == pId) {
               return this.players[i];
           }
       }
    }

    processMatchUpdate(challongeData) {
        var deltaEvents = []

        var theMatches = this.matches;
        for (var i = 0; i < theMatches.length; i++) {
            if (theMatches[i].id == challongeData[i].id) {
                if (theMatches[i].state != challongeData[i].state) {
                    console.log("we have a state change...");

                    var generateEvent = false;

                    if (theMatches[i].state == "pending" && challongeData[i].state == "open") {
                        console.log("..but it's the start of a new match.");
                        // so make sure both players are set?
                        theMatches[i].player1 = challongeData[i].player1;
                        theMatches[i].player2 = challongeData[i].player2;
                    }
                    else if (theMatches[i].state == "open" && challongeData[i].state == "complete") {
                        generateEvent = true;
                        console.log("... and it's the end of the match.");
                    }

                    // update the SOR
                    theMatches[i].state = challongeData[i].state
                    theMatches[i].player1Score = challongeData[i].player1Score;
                    theMatches[i].player2Score = challongeData[i].player2Score;
                    theMatches[i].matchScore = challongeData[i].matchScore;

                    if (generateEvent) {
                        var pinEvent = {};
                        pinEvent.matchId = theMatches[i].id;
                        pinEvent.player1_name = theMatches[i].player1.name;
                        pinEvent.player2_name = theMatches[i].player2.name;
                        pinEvent.player1Score = theMatches[i].player1Score;
                        pinEvent.player2Score = theMatches[i].player2Score;
                        pinEvent.player1Wins = pinEvent.player1Score > pinEvent.player2Score;
                        pinEvent.round = theMatches[i].round;
                        pinEvent.tournamentName = this.name;
                        pinEvent.type = "matchChange";
                        console.log(pinEvent);
                        deltaEvents.push(pinEvent);
                    }
                }
                else { // the state is the same
                    // and if the score is the same, no event needed...
                    if (theMatches[i].matchScore == challongeData[i].matchScore) {
                        // but maybe a player has been set?
                        if (typeof challongeData[i].player1 !== 'undefined') {
                            console.log("we have a player 1...")
                            theMatches[i].player1 = challongeData[i].player1;
                        }

                        if (typeof challongeData[i].player2 !== 'undefined') {
                            console.log("we have a player 2...")
                            theMatches[i].player2 = challongeData[i].player2;
                        }
                    }
                    else {
                        // when something changes, we copy the results from the server to
                        // the values inside our "System of Record": the matches array.
                        console.log("pending match changed!");

                        // Figure out exactly what changed...
                        var player1ScoreChanged = false;
                        var player2ScoreChanged = false;
                        
                        theMatches[i].matchScore = challongeData[i].matchScore;

                        if (theMatches[i].player1Score != challongeData[i].player1Score) {
                            console.log("player1 score changed");
                            player1ScoreChanged = true;
                        }

                        if (theMatches[i].player2Score != challongeData[i].player2Score) {
                            console.log("player2 score changed");
                            player2ScoreChanged = true;
                        }

                        // UPDATE THE SCORE in SOR
                        theMatches[i].player1Score = challongeData[i].player1Score;
                        theMatches[i].player2Score = challongeData[i].player2Score;
                        
                        // add EVENT
                        var pinEvent = {};
                        pinEvent.matchId = theMatches[i].id;
                        pinEvent.round = theMatches[i].round;
                        pinEvent.player1ScoreChanged = player1ScoreChanged;
                        pinEvent.player2ScoreChanged = player2ScoreChanged;

                        // indicate if player1 Score has changed in this update..
                        pinEvent.player1Score = theMatches[i].player1Score;
                        pinEvent.player1_name = theMatches[i].player1.name;

                        // indicate if player2 Score has changed in this update..
                        pinEvent.player2Score = theMatches[i].player2Score;
                        pinEvent.player2_name = theMatches[i].player2.name;

                        pinEvent.tournamentName = this.name;

                        // same state, it's just a score change...
                        pinEvent.type = "scoreChange";
    
                        deltaEvents.push(pinEvent);

                    }
                }
            }
        }
        

        return deltaEvents;
    }

    parseChallongeMatches(data) {
        var challongeMatches = [];
        numOfMatches = data.length;
        for (var i = 0; i < numOfMatches; i++) {
            var aMatch = new Match();
            
            aMatch.id = data[i].match.id;
            aMatch.state = data[i].match.state;
            aMatch.player1 = this.getPlayerById(data[i].match.player1_id);
            aMatch.player2 = this.getPlayerById(data[i].match.player2_id);
            // if there is nothing here, it's 0-0
            if (data[i].match.scores_csv == "") {
                aMatch.matchScore = "0-0";
            }
            else {
                aMatch.matchScore = data[i].match.scores_csv;
            }
            aMatch.round = data[i].match.round;

            aMatch.player1Score = aMatch.matchScore.substring(0, 1);
            aMatch.player2Score = aMatch.matchScore.substring(2, 3);

            //console.log(aMatch.player1Score + " " + aMatch.player2Score);
            //doLogging(aMatch, true);
            challongeMatches.push(aMatch);
        }

        console.log(challongeMatches);

        return challongeMatches;
    }

    loadPlayers(apiKey) {
        var playerUrl = cUrl + "/" + this.id + "/participants.json?api_key=" + apiKey;

        console.log("playersUrl: " + playerUrl);

        var playerDeferred = $.ajax({
            url: playerUrl,
            dataType: "json",
            method: "GET",
            async: false,
            context: this
        }).done(function(data) {
            var theTourney = this;

            numOfPlayers = data.length;
            for (var i = 0; i < numOfPlayers; i++) {
                
                var aPlayer = new Player();
                
                aPlayer.id = data[i].participant.id;
                aPlayer.name = data[i].participant.display_name;
                aPlayer.seed = data[i].participant.seed;
                console.log(aPlayer.seed);
                this.players.push(aPlayer);
            }

            console.log(this.players.length + " players loaded...");
        });

        return playerDeferred;
    }

    loadTournament(apiKey) {

        var playerUrl = cUrl + "/" + this.id + "/participants.json?api_key=" + apiKey;

        console.log("playersUrl: " + playerUrl);

        var playerDeferred = $.ajax({
            url: playerUrl,
            dataType: "json",
            method: "GET",
            context: this,
            async: false
        }).done(function(data) {

            var theTourney = this;

            numOfPlayers = data.length;
            for (var i = 0; i < numOfPlayers; i++) {
                
                var aPlayer = new Player();
                
                aPlayer.id = data[i].participant.id;
                aPlayer.name = data[i].participant.display_name;
                aPlayer.seed = data[i].participant.seed;
                //players.push(aPlayer);
                this.players.push(aPlayer);
            }

            console.log(this.players.length + " players loaded...");

            var matchesUrl = cUrl + "/" + theTourney.id + "/matches.json?api_key=" + apiKey;
            $.ajax({
                url: matchesUrl,
                dataType: "json",
                method: "GET",
                context: theTourney,
                async: false
            }).done(function(data) {
                theTourney.matches = theTourney.parseChallongeMatches(data);
                console.log(theTourney.matches.length + " matches loaded...");
            });
        });

        return playerDeferred;
    }

    fetchTournament(apiKey) {

        var d = $.Deferred();
        var callingUrl = cUrl + "/" + this.id + "/matches.json?api_key=" + apiKey;
        $.ajax({
            url: callingUrl,
            dataType: "json",
            method: "GET",
            async: false,
            context: this
        }).done(function(data) {

            var challongeData = this.parseChallongeMatches(data);

            

            var pinEventChanges = this.processMatchUpdate(challongeData);

            console.log(pinEventChanges);

            pinEventChanges.forEach(function(anEvent) {
                gDeltaEvents.push(anEvent);
            });
            

            d.resolve(this);

            // send update pinMarquee to player/game widgets...
            //window['taco'].emit('panelToPlayerUpdate', JSON.stringify(pinMarquee));
            //window['taco'].emit('panelToActiveGameUpdate', JSON.stringify(pinMarquee));

            // send delts to event widget...
            //window['taco'].emit('pinEvents', JSON.stringify(pinEventChanges));
        });

        return d;
    }
}

class PinMarquee {
    constructor() {
        this.tournaments = [];
        this.currentTournamentIndex = 0;
        this.apiKey = "";
        this.deltaEvents = [];
    }

    fetchResults() {
        // reset deltas
        gDeltaEvents = [];

        var d = $.Deferred();
        //console.log(d.state());
        this.deltaEvents = [];
        var tournament = this.tournaments[i];
        var defArray = [];
        for (var i = 0; i < this.tournaments.length; i++) {
            var fDeferred = this.tournaments[i].fetchTournament(this.apiKey);

            defArray.push(fDeferred);

            fDeferred.done(function(data) {
                console.log(data);
                console.log("fetch Tournament done...");
                //this.deltaEvents.push(data.deltaEvents);
                //console.log(tournament.deltaEvents);
            });


            //this.deltaEvents.push(this.tournaments[i].fetchTournament(this.apiKey));
        }

        var amIDone = false;

        while (!amIDone) {
            console.log(amIDone);
            var b = true;
            for (var j = 0; j < defArray.length; j++) {
                if (defArray[j].state() == "pending") {
                    console.log("something is pending...");
                    b = false;
                }
                console.log(b);
            }

            if (b) {
                amIDone = true;
            }
            
        }
        d.resolve(gDeltaEvents);

        return d;
    }
}