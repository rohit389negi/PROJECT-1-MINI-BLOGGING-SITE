
const authorModel = require('../model/authorModel.js')

const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (req.body.fname && req.body.lname && req.body.title && req.body.email && req.body.password) {
            const verifyEmail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) ? true : false
            if (verifyEmail) {
                let saveauthor = await authorModel.create(data)
                return res.status(200).send({ status: true, data: saveauthor })

            } else {
                return res.status(400).send({ status: false, message: "invalid Email" })

            }
        } else {
            return res.status(400).send({ status: false, message: "Mendatory body missing" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }



}


module.exports = {
    createAuthor
}