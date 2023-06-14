/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Arzu Gizem Kirici Student ID: 135304210 Date: Jun 14,2023
*
*  Cyclic Web App URL: https://agile-veil-hare.cyclic.app
*
*  GitHub Repository URL: https://github.com/agkirici/web322-app
*
********************************************************************************/ 

const epxress = require("express");

const blogService = require("./blog-service.js");
const app = epxress();

const path = require("path");

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')


cloudinary.config({ 
  cloud_name: 'dkl3nddi4', 
  api_key: '527131747989354', 
  api_secret: 'NW3e805bo7c9fxCc-p914HAFdwk' ,
  secure: true
});

const upload = multer(); // no { storage: storage } 


console.log(__dirname);

app.use(epxress.static("./public"));

app.get("/", (request, response) => {
  response.redirect("/about");
});

app.get("/posts", (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    // If category is present in the query parameters, filter posts by category
    const filteredPosts = blogService.getPostsByCategory(category);
    res.json(filteredPosts);
  } else if (minDate) {
    // If minDate is present in the query parameters, filter posts by minimum date
    const filteredPosts = blogService.getPostsByMinDate(minDate);
    res.json(filteredPosts);
  } else {
    // No filters specified, return all posts
    const allPosts = blogService.getAllPosts();
    res.json(allPosts);
  }
  // blogService
  //   .getAllPosts()
  //   .then((data) => {
  //     res.send(JSON.parse(data));
  //   })
  //   .catch((err) => {
  //     res.send(err.message);
  //   });
});

app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);

  // Call the getPostById function from the blog service to retrieve the post by id
  const post = blogService.getPostById(postId);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
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

app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addPost.html'));
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

app.listen(5000, () => {
  console.log("server is listening on port 5000...");
});
