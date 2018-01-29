var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "boilerfaves"
  });

const sql = "SELECT * FROM foods;"

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, function(err, result, fields){
        if(err) throw err;
        console.log("Result: " + JSON.stringify(result));
    });
});