var passcodes = require('./passcodes').passcodes;

const express = require('express')
const app = express()


var mysql = require('mysql')


  app.get('/v1/foods', (req, res) => 
      {
        try{
          
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: passcodes.mysql,
            database: "boilerfaves"
          });

        const retrievalSQL = "SELECT * FROM foods ORDER BY name"
        con.query(retrievalSQL, function (err, result) {
            console.log(result);
            res.send(result);
            if (err) throw err;
          });

        con.end();

        }catch(err){
          console.log(err);
        }

      });
    
   

  
  app.listen(80, () => console.log('Server is listening on port 8080!'))
  