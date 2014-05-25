var events = require('events');

function Detector(threshold, slowTime) {
    var fastTime = slowTime / 2.0;
    events.EventEmitter.call(this);
    var recentData = [];

    var expireOldData = function expireOldData(oldestTime) {
        while (recentData.length > 0 && recentData[recentData.length-1].time < oldestTime) {
            recentData.pop();
        }
    };

    var average = function average(oldestTime) {
        var length = recentData.length;
        var sum = 0;
        var count = 0;
        for (var i = 0; i < length; i++) {
            if (recentData[i].time >= oldestTime) {
                sum = sum + recentData[i].data;
                count++;
            }
        }
        return sum / count;
    }

    var positivePeakEnding = function positivePeakEnding(trendingUp, trendingDown) {
        if (!trendingDown) {
            //console.log("peakEnd due to stop trending down: " + JSON.stringify(recentData));
            this.emit('peakEnd', {
                peakEndTime: recentData[0].time,
                recentData: recentData
            });
            this.currentState = noPeak;
        }
    };

    var negativePeakEnding = function negativePeakEnding(trendingUp, trendingDown) {
        if (!trendingUp) {
            //console.log("peakEnd due to stop trending up: " + JSON.stringify(recentData));
            this.emit('peakEnd', {
                peakEndTime: recentData[0].time,
                recentData: recentData
            });
            this.currentState = noPeak;
        }
    };

    var positivePeakStarting = function positivePeakStarting(trendingUp, trendingDown) {
        if (trendingDown) {
            //console.log("peakTop due to trending down: " + JSON.stringify(recentData));
            this.currentState = positivePeakEnding;
        }
    };

    var negativePeakStarting = function negativePeakStarting(trendingUp, trendingDown) {
        if (trendingUp) {
            //console.log("peakBottom due to trending up: " + JSON.stringify(recentData));
            this.currentState = negativePeakEnding;
        }
    };

    var noPeak = function noPeak(trendingUp, trendingDown) {
        if (trendingUp) {
            //console.log("peakStart due to trending up: " + JSON.stringify(recentData));
            this.emit('peakStart', {
                peakStartTime: recentData[0].time,
                recentData: recentData
            });
            this.currentState = positivePeakStarting;
        } else if (trendingDown) {
            //console.log("peakStart due to trending down: " + JSON.stringify(recentData));
            this.emit('peakStart', {
                peakStartTime: recentData[0].time,
                recentData: recentData
            });
            this.currentState = negativePeakStarting;
        }
    };

    this.currentState = noPeak;

    this.data = function(point) {
        recentData.unshift(point);

        expireOldData(point.time - slowTime);

        var slow = average(0);
        var fast = average(point.time - fastTime);

        var trendingUp = fast - slow > threshold;
        var trendingDown = slow - fast > threshold;

        this.currentState(trendingUp, trendingDown);
    }
}

Detector.prototype.__proto__ = events.EventEmitter.prototype;

var createDetector = function(threshold, slowTime) {
    return new Detector(threshold, slowTime);
}

module.exports = {
    createDetector: createDetector
};
