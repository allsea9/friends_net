var express = require("express");
var router = express.Router();

const fs = require("fs");

const app_name = "친구넷";
const friends_path = __dirname + "/../data/friends.json";
const relations_path = __dirname + "/../data/relations.json";

let user = {};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: app_name });
});

router.post("/list", function (req, res, next) {
  // current user

  user = {
    id: req.body.id,
    name: req.body.name,
  };

  // friends
  let friends = [];
  if (fs.existsSync(friends_path)) {
    let data = fs.readFileSync(friends_path, "utf8");
    friends = JSON.parse(data);
  }

  let f = friends.find((obj) => obj.id == user.id);
  if (f == null) {
    friends.push(user);
  }

  fs.writeFileSync(friends_path, JSON.stringify(friends), "utf8");

  // relations

  let relations = [];
  if (fs.existsSync(relations_path)) {
    let data = fs.readFileSync(relations_path, "utf8");
    relations = JSON.parse(data);
  }

  let relation = relations.find(x => x.id == user.id);
  if (relation) {
    friends.forEach(o => {
      if (relation.list.includes(o.id)) {
        o.checked = "checked";
      } else {
        o.checked = "";
      }     
    });
  }
  
  let context = {
    title: app_name,
    user: user,
    friends: friends,
  };

  res.render("list", { context: context });
});

router.post("/map", function (req, res, next) {

  let newRelations = []
  
  if (req.body.relations) {
    if (typeof req.body.relations === "string")
      newRelations.push(req.body.relations);
    else
      newRelations = req.body.relations;
  }

  let relations = [];
  if (fs.existsSync(relations_path)) {
    let data = fs.readFileSync(relations_path, "utf8");
    relations = JSON.parse(data);
  }

  let r = relations.find((obj) => obj.id == user.id);
  if (r == null) {
    relations.push({id: user.id, list: newRelations});
  } else {
    r.list = newRelations;
  }

  fs.writeFileSync(relations_path, JSON.stringify(relations), "utf8");

  let edges = [];
  relations.forEach(o => {
    if (o.list) {
      o.list.forEach(r => {
        let e = {
          source: o.id,
          target: r
        };

        edges.push(e);
      });
    }
  });



  let friends = [];
  if (fs.existsSync(friends_path)) {
    data = fs.readFileSync(friends_path, "utf8");
    friends = JSON.parse(data);
  }
  
  let f = friends.find((obj) => obj.id == user.id);
  if (f) {
    f.root = true;
  }


  let context = {
    title: app_name,
    user: user,
    nodes: JSON.stringify(friends),
    edges: JSON.stringify(edges)
  };

  res.render("map", { context: context });
});

module.exports = router;
