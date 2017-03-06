const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const SIMULATIONS = 'simulations';
const url = 'mongodb://prestasoc:prestasoc@mongo:27017/prestasoc';
let db;
MongoClient.connect(url, (err, database) => {
  if (err) {
    return console.log(err);
  }
  db = database;
  db.collection(SIMULATIONS).ensureIndex('stats.uuid', {
    unique: true,
    name: 'uuid'
  }, err => {
    if (err) {
      console.log(err);
    }
  });
});

app.get('/stats', (req, res) => {
  Promise.all([
    db.collection(SIMULATIONS).count(),
    db.collection(SIMULATIONS).aggregate([
      {$group: {_id: '$lieuLogement.canton', total: {$sum: 1}}}
    ]).toArray()
  ])
  .then(values => {
    const results = {
      count: values[0],
      cantons: values[1].reduce((cantons, entry) => {
        cantons[entry._id] = entry.total;
        return cantons;
      }, {})
    };

    res.json(results);
  });
});

app.post('/log', (req, res) => {
  res.sendStatus(200);
  if (!req.body.stats || !req.body.stats.uuid) {
    return;
  }
  req.body.stats.headers = req.headers;
  db.collection(SIMULATIONS).replaceOne(
    {'stats.uuid': req.body.stats.uuid},
    req.body,
    {upsert: true},
    err => {
      if (err) {
        return console.log(err);
      }
    });
});


app.listen(8000, () => {
  console.log('listening on 8000');
});
