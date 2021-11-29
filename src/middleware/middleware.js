const authorModel = require('../model/authorModel.js')

const middlewareIsDeleted = async function (req, res, next) {
    let data = req.body.isDeleted
    if(data==true){
        req.body.deletedAt = Date()
        next()
    }else{
        next()
    }
    
}
 


module.exports = {
    middlewareIsDeleted
}