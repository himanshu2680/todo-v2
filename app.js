//jshint esversion:6 , -W033
// f init code
const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")
const mongoose = require('mongoose');
const app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})
// /f

const itemSchema = new mongoose.Schema({
  name: String,
  checked: Boolean
})

const Item = mongoose.model("Item", itemSchema)
var itemsArray =[]

app.get("/", function(req, res) {

  const day = date.getDate()
  Item.find({}, function(err, items){
    if(err){
      console.log(err);
    }
    else{
      res.render("list", {listTitle: day, newListItems: items})
    }
  })

})

app.post("/check", function(req, res){
    var checkedStatus = Boolean(Number(req.body[Object.keys(req.body)[0]])) //returns true if checkbox is checked and false if it is not
    var checkboxNumber = Number(Object.keys(req.body)[0].slice(8,9)) //returns the position of checkbox and starts from 0
      Item.find({}, function(err, items){
        if(err){
          console.log(err);
        }
        else{
          Item.updateOne(items[checkboxNumber], {checked:checkedStatus}, function(){})
        }
      })
    // console.log(Object.keys(req.body)[0] + " " + req.body[Object.keys(req.body)[0]] + " " + checkedStatus);
    res.redirect("/")
})

app.post("/", function(req, res){  
  var newItem = new Item({
    name: req.body.newItem,
    checked:true
  })
  newItem.save()
  // console.log(req.body.checkbox);
  res.redirect("/")
})


// f server started

app.listen(3000, function() {
  console.log("Server started on port 3000")
})
// /f





//smashicons close button