const express = require("express");
const bodyParser = require("body-parser");
const _ =require("lodash");

const mongoose = require("mongoose");
const ejs = require('ejs');
const { stringify } = require("nodemon/lib/utils");
const app = express();
const date = require(__dirname+"/date.js");
// let items = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const itemsSchema={
    name: String
};

const Item= mongoose.model("Item", itemsSchema);
const item1 = new Item({name:"Welcome to TodoList"});
const item2 = new Item({name:"write and hit + to add new"});
const item3 = new Item({name:"Hit <----- to delete item"});

const defaultItems = [item1, item2, item3];

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
   

Item.find({}, function(err, foundItems){
    
    if(foundItems.length == 0){
        Item.insertMany(defaultItems, function(err){
             if(err){console.log(err);}
            else{
                console.log("sucessfully added");
                 }
            });

            res.redirect("/");
    }
    
    else{
    let day = date();
    res.render('list', {kindofday: "Today", newListitems: foundItems});
    }
});

//     var currentDay = today.getDay();
//     var day = "";

//    switch (currentDay) {
//        case 0:
           
//             day = "Sunday";
//             break;
//        case 1:
//            day = "monday";
//            break;
//        case 2:
//            day = "Tuesday";
//            break;
//        case 3:
//            day = "wednesday";
//            break;
//        case 4:
//            day = "Thursday";
//            break;
//        case 5:
//             day = "Friday";
//             break;
//        case 6:
//            day = "Saturday";
//            break;
//        default:
//            break;
//    }
   
    // if(currentDay == 6 || currentDay == 0)
    // {   day = "weekend";
    //     // res.sendFile(__dirname+'');
     
    // }
    // else{
    //     day = "week";
    //     // res.sendFile(__dirname+'');
    
    // }

    
});

app.get("/:coustomListName", function(req,res){

    const customListName =_.capitalize(req.params.coustomListName);
    
    List.findOne({name : customListName}, function(err, foundList){
            if(!err){
                if(!foundList){
                    // create new list
                    const list = new List({
                        name:customListName,
                        items:defaultItems
                    });
                    
                    list.save();
                    res.redirect("/"+ customListName);

                }else{
                    // show the current list
                    res.render("list", {kindofday: customListName, newListitems: foundList.items});
                }
            }
    });

   
});

app.post("/", function(req, res){
    let itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName ==="Today"){
        item.save();
        res.redirect("/");
    
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }


    // items.push(item);
    // console.log(item);
    // res.redirect("/");

});

app.post("/delete", function(req,res){
    console.log(req.body.checkbox);
    let id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(id, function(err){
            if(err){
                console.log(err);
            }
            else {
                console.log("deleted succesfully !");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName}, {$pull:{items: {_id: id } }}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }

   
});



app.get("/about", function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("running at localhost: 3000");
});