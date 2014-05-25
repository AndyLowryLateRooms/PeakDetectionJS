var assert = require("assert");
var should = require('chai').should();
var peakDetector = require('../index.js');

describe('Detector', function() {
    describe('data', function() {
        it('should not detect peak for flat data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakStart', function(peakStartData) {
                peakFound = peakStartData;
            });

            var data = repeat(1.0, 0.0, 100);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.not.exist(peakFound);
        });

        it('should not detect peak for drifting baseline data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakStart', function(peakStartData) {
                peakFound = peakStartData;
            });

            var data = ramp(1.0, 0.0, 0.1, 100);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.not.exist(peakFound);
        });

        it('should detect peak start for positive square data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakStart', function(peakStartData) {
                peakFound = peakStartData;
            });

            var data = repeat(1.0, 0.0, 100);
            var data = addSquarePeak(data, 50.0, 200.0, 100000.0);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.exist(peakFound);
            peakFound.peakStartTime.should.equal(50.0);
        });

        it('should detect peak end for positive square data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakEnd', function(peakEndData) {
                peakFound = peakEndData;
            });

            var data = repeat(1.0, 0.0, 100);
            var data = addSquarePeak(data, 50.0, 70.0, 100000.0);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.exist(peakFound);
            peakFound.peakEndTime.should.equal(81.0);
        });

        it('should detect peak start for negative square data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakStart', function(peakStartData) {
                peakFound = peakStartData;
            });

            var data = repeat(1.0, 0.0, 100);
            var data = addSquarePeak(data, 50.0, 200.0, -100000.0);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.exist(peakFound);
            peakFound.peakStartTime.should.equal(50.0);
        });

        it('should detect peak end for negative square data', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakFound = null;
            detector.on('peakEnd', function(peakEndData) {
                peakFound = peakEndData;
            });

            var data = repeat(1.0, 0.0, 100);
            var data = addSquarePeak(data, 50.0, 70.0, -100000.0);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.exist(peakFound);
            peakFound.peakEndTime.should.equal(81.0);
        });

        it('should detect peak start end for square data with drift', function() {
            var detector = peakDetector.createDetector(1, 10);
            var peakStartFound = null;
            detector.on('peakStart', function(peakStartData) {
                peakStartFound = peakStartData;
            });
            var peakEndFound = null;
            detector.on('peakEnd', function(peakEndData) {
                peakEndFound = peakEndData;
            });

            var data = ramp(1.0, 0.0, 0.1, 100);
            var data = addSquarePeak(data, 50.0, 70.0, 100000.0);

            for (var i = 0; i < data.length; i++) {
                detector.data(data[i]);
            };

            should.exist(peakStartFound);
            peakStartFound.peakStartTime.should.equal(50.0);
            should.exist(peakEndFound);
            peakEndFound.peakEndTime.should.equal(81.0);
        });
    });
});

function repeat(timeStep, value, count) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data.push({
            time: i * timeStep,
            data: value
        });
    };

    return data;
}

function ramp(timeStep, initialValue, valueStep, count) {
    var data = [];

    for (var i = 0; i < count; i++) {
        data.push({
            time: i * timeStep,
            data: initialValue + (i * valueStep)
        });
    };

    return data;
}

function addSquarePeak(data, startTime, endTime, value) {
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        if (point.time >= startTime && point.time <= endTime) {
            point.data = point.data + value;
        }
    };

    return data;
}
