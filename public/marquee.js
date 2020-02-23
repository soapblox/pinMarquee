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

class Player {
    constructor(id, name) {
        this.name = name;
        this.id = id;
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

class PinMarquee {
    constructor() {
        this.players = [];
        this.women = []
        this.matches = [];
        this.womensMatches = [];
    }

    getMatchesByPlayerId(pId) {
        var playerMatches = [];
        //console.log(pId);
        for (var i = 0; i < this.matches.length; i++) {
            //console.log(this.matches[i].player1);
            ///console.log(this.matches[i].player2);
            if (typeof this.matches[i].player1 === 'undefined' || typeof this.matches[i].player2 === 'undefined') {
                //console.log("undefined players on match..");
            }
            else if (this.matches[i].player1.id == pId || this.matches[i].player2.id == pId) {
                //console.log("found player match...");
                //console.log(matches[i]);
                playerMatches.push(this.matches[i]);
            }
        }

        return playerMatches;
    }

    getWomansMatchesByPlayerId(pId) {
        var playerMatches = [];
        //console.log(pId);
        for (var i = 0; i < this.womensMatches.length; i++) {
            //console.log(this.matches[i].player1);
            ///console.log(this.matches[i].player2);
            if (typeof this.womensMatches[i].player1 === 'undefined' || typeof this.womensMatches[i].player2 === 'undefined') {
                //console.log("undefined players on match..");
            }
            else if (this.womensMatches[i].player1.id == pId || this.womensMatches[i].player2.id == pId) {
                //console.log("found player match...");
                //console.log(matches[i]);
                playerMatches.push(this.womensMatches[i]);
            }
        }

        return playerMatches;        
    }

    getWomanById(pId) {
          // match doesn't know what player it is yet, so ignore...
          if (pId == null) {
            return;
        }
        //console.log(this.players.length);
        for (var i = 0; i < this.women.length; i++) {
            if (this.women[i].id == pId) {
                return this.women[i];
            }
        }
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
}