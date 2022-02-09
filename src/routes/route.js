const express = require('express');

const router = express.Router();
const authorController=require('../controllers/authorController')
const blogController=require('../controllers/blogController')
const middleware=require('../middlewares/middleware')

// create Author API
router.post('/authors',authorController.createAuthor )

// Login API for Authorization while login.
router.post('/login',blogController.loginAuthor)

// Create Blog API
router.post('/blogs',middleware.authorisation, blogController.createBlog )

// filter API
router.get('/filterblogs',middleware.authorisation, blogController.getBlog  )

// update blog API
router.put('/blogs/:blogId',middleware.authorisation, blogController.updateDetails)

// delete blog API
router.delete('/blogs/:blogId',middleware.authorisation, blogController.deleteBlog)

// deleteByFilter API
router.delete('/blogs',middleware.authorisation, blogController.deleteSpecific)


module.exports = router;   