/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Arzu Gizem Kirici Student ID: 135304210 Date: July 5,2023
*
*  Cyclic Web App URL: https://agile-veil-hare.cyclic.app
*
*  GitHub Repository URL: https://github.com/agkirici/web322-app
*
********************************************************************************/ 
const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars');
const path = require("path");
const stripJs = require('strip-js');
const blogService = require("./blog-service");

const app = express();

app.use(express.static("./public"));

console.log(__dirname);

// Regular middleware
app.use(express.urlencoded({ extended: true }));


// Register handlebars as the rendering engine for views
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    // Handlebars custom helper to create active navigation links
    // Usage: {{#navLink "/about"}}About{{/navLink}}
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      // Handlebars custom helper to check for equality
      // Usage: {{#equal value1 value2}}...{{/equal}}
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);

app.set('view engine', '.hbs');

cloudinary.config({ 
  cloud_name: 'dkl3nddi4', 
  api_key: '527131747989354', 
  api_secret: 'NW3e805bo7c9fxCc-p914HAFdwk' ,
  secure: true
});

// Variable without any disk storage
const upload = multer(); 

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(function(req, res, next) {
  if (res.statusCode == 404) {
    res.status(404).render('404');
  } else {
    next();
  }
});

// ========== Home Page Route ==========
app.get("/", (req, res) => {
  res.redirect("/blog");
});

// ========== About Page Route ==========
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/posts", (req, res) => {
  const { category, minDate } = req.query;

  if (req.query.category) {
    getPublishedPostsByCategory(req.query.category)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } 
  else {
    getAllPosts()
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "No Results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// ========== Add Post Page Route (GET) ==========
app.get("/posts/add", (req, res) => {
  getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

// ========== Blog By ID Page Route ==========

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};
  try {
    // declare empty array to hold "post" objects
    let posts = [];
    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }
    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    // Obtain the post by "id"
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();
    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get("/categories", (req, res) => {
  getCategories()
  .then((data) => {
    data.length > 0
      ? res.render("categories", { categories: data })
      : res.render("categories", { message: "No Results" });
  })
  // Error Handling
  .catch(() => {
    res.render("categories", { message: "no results" });
  });
});

// ========== Add Categories Route ==========
app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

// ========== Delete Categories Route ==========
app.get("/categories/delete/:id", (req, res) => {
  deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

// ========== Delete Posts Route ==========
app.get("/posts/delete/:id", (req, res) => {
  deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

app.get('/posts/add', (req, res) => {
  blogService.getCategories()
    .then((categories) => {
      res.render('addPost', { categories });
    })
    .catch(() => {
      res.render('addPost', { categories: [] });
    });
});


app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  // Configuring cloudinary image uploading
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    return result;
  }

  // Once the upload is completed, we store the other form data in the object
  upload(req)
    .then((uploaded) => {
      req.body.featureImage = uploaded.url;
      let postObject = {};

      // Add it Blog Post before redirecting to /posts
      postObject.body = req.body.body;
      postObject.title = req.body.title;
      postObject.postDate = new Date().toISOString().slice(0, 10);
      postObject.category = req.body.category;
      postObject.featureImage = req.body.featureImage;
      postObject.published = req.body.published;

      // Adding the post if everything is okay
      // Only add the post if the entries make sense
      if (postObject.title) {
        addPost(postObject).then(() => {
          res.redirect("/posts");
        });
      }
    })
    // Error Handling
    .catch((err) => {
      res.send(err);
    });
});

// ========== Add Categories Post Route ==========
app.post("/categories/add", (req, res) => {
  let catObject = {};
  // Add it Category before redirecting to /categories
  catObject.category = req.body.category;
  if (req.body.category != "") {
    addCategory(catObject)
      .then(() => {
        res.redirect("/categories");
      })
      .catch(() => {
        console.log("Some error occured");
      });
  }
});

app.all("*", (req, res) => {
  res.send("page not found");
});

app.listen(8080, () => {
  console.log("server is listening on port 8080...");
});
