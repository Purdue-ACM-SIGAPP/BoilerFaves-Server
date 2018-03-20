var passcodes = require('./passcodes').passcodes;

var schedule = require('node-schedule')

var mysql = require('mysql')
const fetch = require('node-fetch')


//https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
function getTodaysDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  
  if(dd<10) {
      dd = '0'+dd
  } 
  
  if(mm<10) {
      mm = '0'+mm
  } 
  
  today = mm + '-' + dd + '-' + yyyy;
  return today;
}

function containsFood(foodList, food){

  var found = false;
  for(var i = 0; i<foodList.length; i++){
    if(foodList[i].Name === (food.Name)){
      found = true;
      break;
    }
  }

  return found;
}



    

  //Once a day, connect to the dining api, store all available foods, then add them to the database as needed
  //https://www.npmjs.com/package/node-schedule
  //Should run every day at 1:02 AM
  schedule.scheduleJob("Fetch and Store", "* * * * * *", () => {

      try{

        var con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: passcodes.mysql,
          database: "boilerfaves"
        });


        con.connect(function(err) {

          if (err) throw err;
            storeScript(con);

          })
        }catch(err){

          if(err){
            console.log(err);
          }

          setTimeout(() => {
            storeScript(con);
          }, 5000)
      }

});

function storeScript(con){

  fetch('https://api.hfs.purdue.edu/menus/v1/locations/', {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
    body: '{}'
  }).then(response => {
    return response.json();
  }).then(json => {

    var fetchCalls = [];

    for(var i =0; i<json.length; i++){
      var url = 'https://api.hfs.purdue.edu/menus/v1/locations/' + json[i] + '/' + '3-07-2018' + '/';
      
      fetchCalls.push(fetch(url, {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
          body: '{}'
        }).then(response => {
          return response.json();
        }).then(json => {
          var meals = [json.Breakfast, json.Lunch, json.Dinner];
        
          var foods = [];

          for(var i = 0; i<meals.length; i++){
            for(var j = 0; j<meals[i].length; j++){
              for(var k = 0; k<meals[i][j].Items.length; k++){
              if(!containsFood(foods, meals[i][j].Items[k])){
                foods.push(meals[i][j].Items[k]);
              }
              }
            }
          }

          return foods;
          
        }).catch(err => {console.log(err);}));

    }

    //All of the dining courts have been called. Time to put the list together
    Promise.all(fetchCalls).then(function(values){
      //List of all foods available today (no duplicates)
      var allFoods = [];

      for(var i = 0; i<values.length; i++){
        for(var j =0; j<values[i].length; j++){
          if(!(containsFood(allFoods, values[i][j]))){
            allFoods.push(values[i][j]);
          }
        }
      }


        for(var i = 0; i<allFoods.length; i++){
          var food = allFoods[i];
          var lookSQL = `SELECT * FROM foods WHERE name=?`;
          var inserts = [allFoods[i].Name];
          lookSQL = mysql.format(lookSQL, inserts);
          con.query(lookSQL, 
            (function(passedFood){
              return function(err, result, fields){
              if(err) throw err;
              //console.log("Result: " + JSON.stringify(result));
              if(result.length <= 0){
                //Food wasn't found in the database, need to add it
                var insertSQL = `INSERT INTO foods (name, isVegetarian) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name`;
                var inserts = [passedFood.Name, passedFood.IsVegetarian]
                insertSQL = mysql.format(insertSQL, inserts);
                con.query(insertSQL, function (err, result) {
                  if (err) throw err;
                });
              }
            }
          })(food));
        
        }

    });

  }).catch(err => {console.log(err);});
    
}
