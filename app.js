//jshint esversion:6 , -W033
// f init code
const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")
const mongoose = require('mongoose')
const lodash = require('lodash')
const app = express()
var defaultItems=[{name:"item 1"}, {name:"item 2"}, {name:"item 3"}]
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
mongoose.connect("mongodb+srv://himanshuAdmin:Admin123@cluster0.lgfwg.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false})
// /f

const itemSchema = new mongoose.Schema({
  name: String,
  checked: Boolean
})
const day = date.getDate()
const Item = mongoose.model("Item", itemSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, items){
    if(!err){
      res.render("list", {listTitle: day, newListItems: items})
    }
  })
})


const customListSchema = new mongoose.Schema(
  {
    title:String,
    listItems:[itemSchema]
  }
)
const CustomList = mongoose.model("CustomList", customListSchema)

app.get("/:customListName", function(req, res){
  var customListName = lodash.capitalize(req.params.customListName)
  
  CustomList.findOne({title:customListName}, function (err, list) {
    if (err) {
      console.log(err);
    }
    else{
      //render the said list
      if (list) {
        res.render("list", {listTitle: list.title, newListItems: list.listItems})
      }
      //create one and render
      else {
        var newList = new CustomList({title:customListName, listItems: defaultItems})
        newList.save()
        res.render("list", {listTitle: newList.title, newListItems: newList.listItems})
      }
    }
  })
  
})



app.post("/check", function(req, res){
  var itemId = Object.keys(req.body)[0]
  var listName = req.body.list
  var checkedStatus = Boolean(Number(req.body[itemId]))
  
  if (listName===day) {
    Item.findByIdAndUpdate(itemId, { checked: checkedStatus }, ()=>{})
    res.redirect("/")
  }
  else {
    CustomList.updateOne(
      {title:listName, "listItems._id":itemId}, 
      { $set:{"listItems.$.checked":checkedStatus} }, ()=>{}
    )
    res.redirect("/"+listName)
  }
  
})


app.post("/close", function(req, res){
  var listName = req.body.list
  var deleteId = req.body.delete
  if (listName===day) {
    Item.deleteOne({_id:deleteId}, function(err){})
    res.redirect("/")
  }
  else {
    CustomList.updateOne(
      {title:listName}, 
      { $pull:{listItems:{_id:deleteId}} }, 
      (err, foundThis)=>{
        if (err) {
          console.log(err);
        }
        else {
          console.log("deleted one");
        }
    })
    res.redirect("/"+listName)

  }
})


app.post("/", function(req, res){  
  var listTitle = req.body.list
  var newItem = new Item({
    name: req.body.newItem,
    checked:false
  })
  if (listTitle===day) {
    newItem.save()
    res.redirect("/")
  }
  else {
    CustomList.findOne({title: listTitle}, (err, foundThis)=> {
      if (err) {
        console.log(err);
      }
      else {        
        foundThis.listItems.push(newItem)
        foundThis.save()
        res.redirect("/" + listTitle)
      }
    })
  }
})



// f server started

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000")
})
// /f
