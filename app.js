const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
mongoose.connect("mongodb+srv://samarthya-gupta:Samarthya123@cluster0.cvg3o.mongodb.net/todolistDB" , {useNewUrlParser : true})
const app = express();
app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static("public"));
app.set('view engine', 'ejs');

const itemSchema = {
    name : String
};
const Item = mongoose.model("item" , itemSchema);
const item1 = new Item({
    name : "Welcome this is you to do list."
});
const item2 = new Item({
    name : "Click on  + to add items."
});
const item3 = new Item({
    name : "<---- click here to delete the item."
});

const defaultitems = [item1 , item2 , item3];

const listSchema = {
    name : String ,
    item : [itemSchema]
};

const List = mongoose.model("List" , listSchema)




app.get("/" , function(req,res){
    Item.find({} , function(err,data){
        if(data.length === 0){
            Item.insertMany(defaultitems , function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("success");
                }
            });
            res.render("list" , {kindDay : "Today" , newItem : data})
        }
        else{
            res.render("list" , {kindDay : "Today" , newItem : data})
        }
        
    })
});


app.post("/" , function(req,res){
    var task1 = req.body.task ;
    var title = req.body.list;
    
    const item = new Item ({
       name : task1
    })

    if(title === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : title} , function(err , data){
            
            data.item.push(item);
            data.save();
            res.redirect("/" + title);
        })
    }
    

})

app.post("/delete" , function(req,res){
    const itemdelete = req.body.checkbox;
    const listname = req.body.titlename ;
    if(listname === "Today"){
        Item.deleteOne({_id : itemdelete} ,function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/")
            }
        })

    }else {
        List.findOneAndUpdate({name : listname} , {$pull: {item : {_id : itemdelete}}} , function(err , result){
            if(!err){
                console.log(listname + " " + itemdelete)
                res.redirect("/" + listname);
            }else{
                console.log(err);
            }
        })

    }
    
})

app.get("/:listtype", function(req,res){
    const listname =_.capitalize(req.params.listtype);
    List.findOne( {name : listname} ,function(err ,result){
        if(!err){
            if(!result){
                const list = new List({
                    name : listname,
                    item : defaultitems
                });
                list.save();
                res.redirect("/" + listname);
            }else{
                res.render("list" , {kindDay : result.name , newItem : result.item});
            }
        }
    })      
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};


app.listen(port,function(req,res){
    console.log("server started at 3000");
});