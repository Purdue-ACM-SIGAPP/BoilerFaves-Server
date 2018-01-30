const express = require('express')
const app = express()

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

console.log(getTodaysDate());

fetch('https://api.hfs.purdue.edu/menus/v1/locations/', {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
    body: '{}'
  }).then(response => {
    return response.json();
  }).then(json => {

    var fetchCalls = [];

    for(var i =0; i<json.length; i++){
      var url = 'https://api.hfs.purdue.edu/menus/v1/locations/' + json[i] + '/' + getTodaysDate() + '/';
      
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

    Promise.all(fetchCalls).then(function(values){
      var allFoods = [];

      for(var i = 0; i<values.length; i++){
        for(var j =0; j<values[i].length; j++){
          if(!(containsFood(allFoods, values[i][j]))){
            allFoods.push(values[i][j]);
          }
        }
      }

      //List of all foods available today (no duplicates)
      console.log(allFoods);

    });

  }).catch(err => {console.log(err);});


app.get('/', (req, res) => 

    res.send('Hello World! From boilerfaves server'));

app.listen(3000, () => console.log('Server is listening on port 3000!'))

