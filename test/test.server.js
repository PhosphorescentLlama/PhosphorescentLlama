var mocha = require('mocha');

var chai = require('chai');

var mongoose = require('mongoose');

var http = require('http');

var paths = require('../paths.js');

var SequencerModel = require(paths.models + '/sequencerModel.js');

var Controller = require(paths.controllers + '/levelsController.js');

var Beat = require(paths.classes + '/Beat.js');

var Bus = require(paths.classes + '/Bus.js');

var Sequence = require(paths.classes + '/Sequence.js');

var Sequencer = require(paths.classes + '/Sequencer.js');

describe('Sequencer / Server Integration Test', function () {

  var sequencerData;
  // Clear database and create a sequencer before each test
  beforeEach(function (done) {

    var xhrDELETE = new XMLHttpRequest();
    xhrDELETE.open("DELETE", "http://localhost:44100/levels/1000", true);
    xhrDELETE.onload = function(){
      var xhrPOST = new XMLHttpRequest();
      xhrPOST.open("POST", "http://localhost:44100/levels", true);
      sequencerData = JSON.stringify({
        "tempo":120,
        "tickNumber":2,
        "soundIDs":["kick","clap"],
        "sequences":{
          "kick":[{"isOn":true},{"isOn":false}],
          "clap":[{"isOn":false},{"isOn":true}]
        }
      });

      var body = {
        "level": 1000,
        "data": sequencerData
      };

      xhrPOST.setRequestHeader("Content-Type", "application/json");
      xhrPOST.onload = function() {
        done();
      };
      xhr.send();
    };

    xhrDELETE.send();
  });

  it('should have a method that given the level of a sequencer, retrieves its record from the database', function (done) {

    var xhrGET = new XMLHttpRequest();
    xhrGET.open("GET", "http://localhost:44100/levels/1000", true);
    xhrGET.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      expect(xhrGET.response).to.equal(sequencerData);
      done();
    };
    xhrGET.send();

  });

  it('should have a method that given the level of a sequencer, updates its `data` property', function (done) {

    var body = {
      "level": 1000,
      "data": JSON.stringify({
        "tempo":60,
        "tickNumber":2,
        "soundIDs":["kick","clap"],
        "sequences":{
          "kick":[{"isOn":true},{"isOn":false}],
          "clap":[{"isOn":false},{"isOn":true}]
        }
      })
    };
    var xhrPUT = new XMLHttpRequest();
    xhrPUT.open("PUT", "http://localhost:44100/levels", true);
    xhr.onload = function() {
      var xhrGET = new XMLHttpRequest();
      xhrGET.open("GET", "http://localhost:44100/levels", true);
      xhrGET.onload = function() {
        expect(JSON.parse(xhrGET.response).data.tempo).to.equal(60);
        done();
      };
      xhrGET.send();
    };
    xhrPUT.send();
  });

});
