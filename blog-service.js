const fs = require("fs");

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

module.exports = {
  getAllPosts,
  getCategories,
  getPublishedPosts,
};
