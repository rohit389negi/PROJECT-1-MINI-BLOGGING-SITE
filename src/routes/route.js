const express = require('express');
const router = express.Router();
const authorController=require('../controller/authorController')
const blogController=require('../controller/blogController')
const middleware=require('../middleware/middleware')
router.get('/test-me', function (req, res) {
    res.send('My first ever api!')
});


// create Author API
router.post('/authors',authorController.createAuthor )
// Create Blog API
router.post('/blogs', blogController.createBlog )

// filter API
router.get('/filterblogs', blogController.returnBlogsFiltered  )
// update blog API
router.put('/blogs/:blogId',middleware.blogId,blogController.updateDetails)
// delete blog API
router.delete('/blogs/:blogId',middleware.blogId,blogController.deleteBlog)
// deleteByFilter API
router.delete('/blogs',blogController.deleteSpecific)
module.exports = router;   