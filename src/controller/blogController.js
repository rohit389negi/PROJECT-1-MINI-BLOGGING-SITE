const blogModel = require('../model/blogModel.js')
const authorModel = require('../model/authorModel.js')



// const loginAuthor = async function(req,res){
//      if(req.body && req.body.email && req.body.password){
//         let author = await authorModel.findOne({ email: req.body.email, password: req.body.password, isDelete: false })
//           if(user){
//             let payload = { _id: author._id, email: author.email }
//             let generateToken = jwt.sign(payload, 'projectBlog')
//             res.status(200).send({ status: true, data: { authorId: author._id }, token: generateToken })
//           }else{
//             res.status(401).send({ status: false, message: "invalid Username or Password" })
//           } 
//      }else{
//         res.status(400).send({ status: false, message: "Request body must contain Username and Password" })
//      }
// }



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

const returnBlogsFiltered = async function (req, res) {
    try {
        const blogFound = await blogModel.find(req.query);
        res.status(200).send({ msg: "succes", data: blogFound });

    } catch (err) {
        res.status(500).send({ msg: err });
    }

}

const updateDetails = async function (req, res) {
    try {
        const title = req.body.title;
        const body = req.body.body;
        const tags = req.body.tags;
        const subcategory = req.body.subcategory;
        let Update = {}
        Update.title = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { title: title }, { new: true })
        Update.body = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { body: body }, { new: true })
        Update.tags = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { tags: tags } }, { new: true })
        Update.subcategory = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { subcategory: subcategory } }, { new: true })
        Update.isPublished = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { isPublished: true }, { new: true })
        Update.publishedAt = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { publishedAt: Date() }, { new: true })
        let updatedBlog = await blogModel.find({ _id: req.params.blogId })

        res.send({ data: updatedBlog })

    } catch (err) {
        res.status(500).send({ msg: err });
    }

}

const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId

        if (id) {
            let user = await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true })
            res.status(200).send({ status: true })

        } else {
            res.status(404).send({ status: false, msg: "Blog Id not found" })
        }

    } catch (err) {
        res.status(500).send({ msg: err });
    }


}


const deleteSpecific = async function (req, res) {
    try {
        let obj = {};
        if (req.query.category) {
            obj.category = req.query.category
        }
        if (req.query.authorId) {
            obj.authorId = req.query.authorId;
        }
        if (req.query.tags) {
            obj.tags = req.query.tags
        }
        if (req.query.subcategory) {
            obj.subcategory = req.query.subcategory
        }
        if (req.query.published) {
            obj.isPublished = req.query.isPublished
        }
        let data = await blogModel.findOne(obj);
        if (!data) {
            return res.status(404).send({ status: false, msg: "The given data is Invalid" });
        }
        data.isDeleted = true;
        data.save();
        res.status(200).send({ msg: "succesful", data: data });
    }
    catch (err) {
        res.status(500).send({ msg: err });
    }
}
module.exports = {
    createBlog, returnBlogsFiltered, updateDetails, deleteBlog, deleteSpecific
}
