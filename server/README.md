Server:
=======

REST API:
---------

```
Method | URL         | Request Body | Response Body |
GET    | /levels/:id | Empty        | JSON string   |
POST   | /levels     | JSON string  | Empty         |
PUT    | /levels     | JSON String  | Empty         |
DELETE | /levels/:id | Empty        | Empty         |
```

### General
Inside the file `/server/controllers/levelsController.js`, there are four methods; getLevel, saveLevel, updateLeve, and deleteLevel. They are exported and used as the server API.

### GET to `/levels/:id`
getLevel method will handle a GET request made to `/levels/:id`. As a response, a corresponding sequencer data for the id will be retrieved from the database.

Retrieved sequencer data will be a JSON string, which can be parsed and used to instantiate a new sequencer. An example of the retrieved JSON string will look like this:

```
"{
  "tempo":120,
  "tickNumber":4,
  "soundIDs":["kick","clap"],
  "sequences":{
    "kick":[{"isOn":true},{"isOn":false},{"isOn":true},{"isOn":false}],
    "clap":[{"isOn":false},{"isOn":true},{"isOn":false},{"isOn":true}]
  }
}"
```

### POST to `/levels`
saveLevel method will handle a POST request made to `/levels`. It will save a new sequencer to the database, with the level and data parsed from the user interface.

### PUT to `/levels`
updateLevel will handle a PUT request made to `/levels`. It will update an existing sequencer data with the new data parsed from the user interface with a particular id (level).

### DELETE to `/levels/:id`
deleteLevel will handle a DELETE request made to `/levels/:id`. It will remove a sequencer data in the database of which the id is the number parsed from the user interface.
