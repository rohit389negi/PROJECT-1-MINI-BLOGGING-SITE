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
    const blogData = await blogModel.find({ isDeleted: false, isPublished: true })
    if (!blogData) {
        res.status(200).send({ status: true, data: blogData })
    }
    else {
        res.status(404).send({ status: false, message: 'Not Found' })
    }
}
const returnBlogsFiltered = async function (req, res) {
    //console.log(req.query);
    const blogFound = await blogModel.find(req.query);
    res.status(200).send({ msg: "succes", data: blogFound });
}

const updateDetails = async function (req, res) {
    const title = req.body.title;
    const body = req.body.body;
    const tags = req.body.tags;
    const subcategory = req.body.subcategory;
   
    let Update = await blogModel.findOneAndUpdate({ _id: req.params.blogId },{ title: title },{body:body} ,/*{$push: { tags: tags }},{$push: {subcategory: subcategory }},*/{ new: true})
   
    // let bodyUpdate = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { body: body }, { new: true })
    // let tagsUpdate = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { tags: tags }}, { new: true })
    // let subcategoryUpdate = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { subcategory: subcategory } }, { new: true })
    console.log(Update)
    res.send({Update})
}

module.exports = {
    createBlog, getBlog, returnBlogsFiltered, updateDetails
}
