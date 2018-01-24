const express = require('express')
const app = express()

const fetch = require('node-fetch')


fetch('https://api.hfs.purdue.edu/menus/v1/locations/earhart/12-01-2017', {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
    body: '{}'
  }).then(response => {
    return response.json();
  }).then(json => {
    console.log(json)
  }).catch(err => {console.log(err);});


app.get('/', (req, res) => 

    res.send('Hello World! From boilerfaves server'));

app.listen(3000, () => console.log('Server is listening on port 3000!'))

