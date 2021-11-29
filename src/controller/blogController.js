const mongoose = require('mongoose');
const blogModel = require('../model/blogModel.js')
const authorModel = require('../model/authorModel.js')

const createBlog = async function (req, res) {

    try {
        let data = req.body
        if (data) {
            let user = await authorModel.findById({ _id: req.body.authorId })
            if (user) {
                let savedBlog = await blogModel.create(data)
                res.status(201).send({ status: true, msg: "succesful blog creation", data: savedBlog })
            } else (
                res.status(400).send({ status: false, msg: "invalid Author Id" })
            )
        } else {
            res.status(400).send({ status: false, msg: "Mendatory body missing" })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

const getBlog = async function (req, res) {
    let authorId = req.query.authorId
    let category = req.query.category
    let tag = req.query.tags
    let subcategory = req.query.subcategory
    let data = req.query
    if (data) {
        blogData = await blogModel.findOne({ isDeleted: false, isPublished: true })
        if (blogData) {
            if (blogData.authorId == req.query.authorId) {
                if (authorId || category || tag || subcategory) {
                    let final = await blogModel.find({ tags : req.query.tags })//*, category : req.query.category , authorId :req.query.authorId, subcategory : req.query.subcategory})
                    
                    res.status(200).send({ status: true, data: final })
                } else {
                    res.status(401).send({ status: false, msg: "Bad Request" })
                }

            } else {
                res.status(404).send({ status: false, msg: "authorId not Found" })
            }
        } else (
            res.status(400).send({ status: false, msg: "No such Blog" })
        )
    } else {
        res.status(401).send({ status: false, msg: "Missing mendatory request" })
    }
}


module.exports = {
    createBlog,getBlog 
}