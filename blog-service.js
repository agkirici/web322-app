const fs = require("fs");
const posts = [];

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/categories.json", "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const filteredPosts = JSON.parse(data).filter(
          (post) => post.published === true
        );
        resolve(filteredPosts);
      }
    });
  });
};

function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve(postData);
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category === parseInt(category));

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No results returned");
    }
  });
}
function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => new Date(post.postDate) >= new Date(minDateStr));

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No results returned");
    }
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === id);

    if (post) {
      resolve(post);
    } else {
      reject("No result returned");
    }
  });
}

module.exports = {
  getAllPosts,
  getCategories,
  getPublishedPosts,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  
};
