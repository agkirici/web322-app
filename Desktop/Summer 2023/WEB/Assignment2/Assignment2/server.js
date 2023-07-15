/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Arzu Gizem Kirici Student ID: 135304210 Date: May 30,2023
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: https://github.com/agkirici/web322-app
*
********************************************************************************/ 

const epxress = require("express");

const blogService = require("./blog-service.js");
const app = epxress();

const path = require("path");

console.log(__dirname);

app.use(epxress.static("./public"));

app.get("/", (request, response) => {
  response.redirect("/about");
});

app.get("/posts", (req, res) => {
  blogService
    .getAllPosts()
    .then((data) => {
      res.send(JSON.parse(data));
    })
    .catch((err) => {
      res.send(err.message);
    });
});

app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});
app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      res.send(JSON.parse(data));
    })
    .catch((err) => {
      res.send(err.message);
    });
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/about.html"));
});

app.all("*", (req, res) => {
  res.send("page not found");
});

app.listen(5000, () => {
  console.log("server is listening on port 5000...");
});
