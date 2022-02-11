// title: {mandatory}, body: {mandatory}, authorId: {mandatory, refs to author model}, 
// tags: {array of string},examples: [technology, entertainment, life style, food, fashion]}, 
// category: {string, mandatory,
// subcategory: {array of string,examples[technology-[web development, mobile development, AI, ML etc]] }, 
// deletedAt: {when the document is deleted}, 
// isDeleted: {boolean, default: false}, 
// publishedAt: {when the blog is published}, 
// isPublished: {boolean, default: false}}

//Make sure the authorId is a valid authorId by checking the author exist in the authors collection.
// POST /blogs

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function(value) {
    return ObjectId.isValid(value)
}
const createBlog = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: 'request body not found'})
        }
        const {title, body, authorId, category, tags, subcategory} = requestBody;
        if(!isValid(title)) {
            return res.status(400).send({status: false, message: 'Blog Title is required'})
        }
        if(!isValid(body)) {
            return res.status(400).send({status: false, message: 'Blog body is required'})
        }
        if(!isValid(authorId)) {
            return res.status(400).send({status: false, message: 'Author id is required'})
        }
        if(!(authorId == req.authorId)){
            return res.status(404).send({status:false, message:'Access denied'})
        }
        if(!isValidObjectId(authorId)) {
            return res.status(400).send({status: false, message: `${authorId} is not a valid author id`})
        }
        if(!isValid(category)) {
            return res.status(400).send({status: false, message: 'Blog category is required'})
        }
        const author = await authorModel.findById(authorId);
        if(!author) {
            return res.status(400).send({status: false, message: `Author does not exit`})
        }
        const blogData = {title,body,authorId,category}
        if(tags) {
            if(Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === "[object String]") {
                blogData['tags'] = [ tags ]
            }
        }
        if(subcategory) {
            if(Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData['subcategory'] = [ subcategory ]
            }
        }
        const newBlog = await blogModel.create(blogData)
        res.status(201).send({status: true, message: 'New blog created successfully', data: newBlog})
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

//GET /blogs
const getBlog = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, isPublished: true}
        const queryParams = req.query
        if(isValidRequestBody(queryParams)) {
            const {authorId, category, tags, subcategory} = queryParams
            if(isValid(authorId) && isValidObjectId(authorId)) {
                filterQuery.authorId = authorId
            }
            if(isValid(category)) {
                filterQuery.category = category.trim()
            }
            if(isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery.tags = {$all: tagsArr}
            }
            if(isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filterQuery.subcategory = {$all: subcatArr}
            }
        }
        const blogs = await blogModel.find(filterQuery)
        if(blogs.length===0) {
            res.status(404).send({status: false, message: 'No blogs found'})
            return
        }
        res.status(200).send({status: true, message: 'Blogs list', data: blogs})
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

//PUT /blogs/:blogId
const updateBlog = async function (req, res) {
    try {
        const requestBody = req.body
        const blogId = req.params.blogId
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: 'request body not found'})
        }
        if(!isValidObjectId(blogId)) {
            res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
            return
        }
        const blog = await blogModel.findOne({_id: blogId, isDeleted: false})
        if(!blog) {
            res.status(404).send({status: false, message: `Blog not found`})
            return
        }
        if(blog.authorId !== req.authorId) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
            return
        }
        const {title, body, tags, category, subcategory} = requestBody;
        let newBlog = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false },
             { title, body, $addToSet: { subcategory: subcategory, tags: tags } }, { new: true })
        res.status(200).send({status: true, message: 'Blog updated successfully', data: newBlog});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

//DELETE /blogs/:blogId
const deleteBlogByID = async function (req, res) {
    try {
        const blogId = req.params.blogId
        if(!isValidObjectId(blogId)) {
            res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
            return
        }
        if(!isValidObjectId(req.authorId)) {
            res.status(400).send({status: false, message: `${req.authorId} is not a valid token id`})
            return
        }
        const blog = await blogModel.findOne({_id: blogId, isDeleted: false, deletedAt: null })
        if(!blog) {
            res.status(404).send({status: false, message: `Blog not found`})
            return
        }
        if(blog.authorId.toString() !== req.authorId) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
            return
        }
        await blogModel.findOneAndUpdate({_id: blogId}, {$set: {isDeleted: true, deletedAt: new Date()}})
        res.status(200).send({status: true, message: `Blog deleted successfully`})
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

//DELETE /blogs?queryParams
const deleteBlogByParams = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, deletedAt: null}
        const queryParams = req.query
        if(!isValidObjectId(req.authorId)) {
            res.status(400).send({status: false, message: `${req.authorId} is not a valid token id`})
            return
        }
        if(!isValidRequestBody(queryParams)) {
            res.status(400).send({status: false, message: `No query params received. Aborting delete operation`})
            return
        }
        const {authorId, category, tags, subcategory, isPublished} = queryParams
        if(isValid(authorId) && isValidObjectId(authorId)) {
            filterQuery.authorId = authorId
        }
        if(isValid(category)) {
            filterQuery.category = category.trim()
        }
        if(isValid(isPublished)) {
            filterQuery.isPublished = isPublished
        }
        if(isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery.tags = {$all: tagsArr}
        }
        if(isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery.subcategory = {$all: subcatArr}
        }
        const blogs = await blogModel.find(filterQuery);
        if(blogs.length===0) {
            res.status(404).send({status: false, message: 'No matching blogs found'})
            return
        }
        const idsOfBlogsToDelete = blogs.map(blog => {
            if(blog.authorId.toString() === req.authorId) return blog._id
        })
        if(idsOfBlogsToDelete.length === 0) {
            res.status(404).send({status: false, message: 'No blogs found'})
            return
        }
        await blogModel.updateMany({_id: {$in: idsOfBlogsToDelete}}, {$set: {isDeleted: true, deletedAt: new Date()}})
        res.status(200).send({status: true, message: 'Blog deleted successfully'});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {createBlog, getBlog, updateBlog, deleteBlogByID, deleteBlogByParams}



        // const updatedBlogData = {}
        // if(isValid(title)) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
        //     updatedBlogData['$set']['title'] = title
        // }
        // if(isValid(body)) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
        //     updatedBlogData['$set']['body'] = body
        // }
        // if(isValid(category)) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
        //     updatedBlogData['$set']['category'] = category
        // }
        // if(isPublished !== undefined) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
        //     updatedBlogData['$set']['isPublished'] = isPublished
        //     updatedBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        // }
        // if(tags) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}   
        //     if(Array.isArray(tags)) {
        //         updatedBlogData['$addToSet']['tags'] = { $each: [...tags]}
        //     }
        //     if(typeof tags === "string") {
        //         updatedBlogData['$addToSet']['tags'] = tags
        //     }
        // }
        // if(subcategory) {
        //     if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
        //     if(Array.isArray(subcategory)) {
        //         updatedBlogData['$addToSet']['subcategory'] = { $each: [...subcategory]}
        //     }
        //     if(typeof subcategory === "string") {
        //         updatedBlogData['$addToSet']['subcategory'] = subcategory
        //     }
        // }
        // const updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, updatedBlogData, {new: true})


