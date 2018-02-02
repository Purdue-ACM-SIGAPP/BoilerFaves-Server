const express = require('express')
const app = express()

var mysql = require('mysql')
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "boilerfaves"
  });

  app.get('/', (req, res) => 
      {
        const retrievalSQL = "SELECT * FROM foods ORDER BY name"
        con.query(retrievalSQL, function (err, result) {
            console.log(result);
            res.send(result);
            if (err) throw err;
          });
      });
  
  app.listen(8080, () => console.log('Server is listening on port 3000!'))
  