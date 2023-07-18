/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Arzu Gizem Kirici Student ID: 135304210 Date: July 18,2023
*
*  Cyclic Web App URL: https://agile-veil-hare.cyclic.app
*
*  GitHub Repository URL: https://github.com/agkirici/web322-app
*
********************************************************************************/ 

const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const express = require("express");
const epxress = require("express");
const blogService = require("./blog-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const {
  initialize,
  getAllPosts,
  getCategories,
  addPost,
  getPostById,
  getPublishedPostsByCategory,
  getPostsByMinDate,
  addCategory,
  deleteCategoryById,
  deletePostById,
} = require("./blog-service.js");

const app = express();

cloudinary.config({ 
  cloud_name: 'dkl3nddi4', 
  api_key: '527131747989354', 
  api_secret: 'NW3e805bo7c9fxCc-p914HAFdwk' ,
  secure: true
});

const upload = multer(); // no { storage: storage } 




console.log(__dirname);

app.use(epxress.static("./public"));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
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

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
  if (res.statusCode == 404) {
    res.status(404).render('404');
  } else {
    next();
  }
});

app.get("/", (request, response) => {
  response.redirect("/blog");
});

app.get("/posts", (req, res) => {
 
  if (req.query.category) {
    getPublishedPostsByCategory(req.query.category)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "No Results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }


  else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "No Results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
  else {
    getAllPosts()
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "No Results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

  app.get('/blog/:id', async (req, res) => {

    
    let viewData = {};
    try{
      
        let posts = [];
      
        if(req.query.category){
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
          }
        else{
            posts = await blogService.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{  
        viewData.post = await blogService.getPostById(req.params.id, viewData.posts);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        let categories = await blogService.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", {data: viewData})
});

app.get('/blog', async (req, res) => {

  let viewData = {};

  try{

   
      let posts = [];

    
      if(req.query.category){
       
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
 
          posts = await blogService.getPublishedPosts();
      }

  
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      let post = posts[0]; 
    
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
    
      let categories = await blogService.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})

});

app.get("/categories", (req, res) => {
  getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "No Results" });
      }
    })
    .catch(() => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
  let catObject = {};
  catObject.category = req.body.category;
  
  if (req.body.category != "") {
    addCategory(catObject)
      .then(() => {
        res.redirect("/categories");
      })
      .catch(() => {
        console.log("Some error occurred");
      });
  }
});

app.get("/categories/delete/:id", (req, res) => {
  deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("/posts/delete/:id", (req, res) => {
  deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch((err) => {
      res.status(500).send("Unable to remove post / Post not found");
    });
});

app.get("/about", (req, res) => {	
  res.render("about");	
});

app.get("/posts/add", (req, res) => {
  getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});


app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
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
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processPost(uploaded.url);
      })
      .catch((error) => {
        console.error(error);
        processPost('');
      });
  } else {
    processPost('');
  }
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    const newPostData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      published: req.body.published
    };

    // Call the addPost function from the blog service to add the new blog post
    blogService.addPost(newPostData)
      .then((addedPostData) => {
        console.log('New blog post added:', addedPostData);
        res.redirect('/posts');
      })
      .catch((error) => {
        console.error('Failed to add new blog post:', error);
        res.redirect('/posts/add');
      });
  }
});

app.all("*", (req, res) => {
  res.send("page not found");
});

app.listen(8080, () => {
  console.log("server is listening on port 8080...");
});
