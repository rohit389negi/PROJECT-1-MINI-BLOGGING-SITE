
const authorModel = require('../model/authorModel.js')

const createAuthor = async function (req, res) {
    try {
        let data = req.body
        const checkEmail = req.body.email
        const regex = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        if (data) {
            if (regex.test(checkEmail)) {
                let saveauthor = await authorModel.create(data)
                res.status(200).send({ status: true, data: saveauthor })

            } else {
                res.status(400).send({ status: false, message: "invalid Email" })

            }

        } else {
            res.status(400).send({ status: false, message: "Mendatory body missing" })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }



}

// function ValidateEmail(mail) {
//     if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value)) {
//         return (true)
//     } alert("You have entered an invalid email address!")
//     return (false)
// }

module.exports = {
    createAuthor
}