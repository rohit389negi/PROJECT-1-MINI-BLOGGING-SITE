const jwt = require('jsonwebtoken')

const authorisation = async function(req,res,next){
    try{
        const token = req.header('x-api-key')
        if(!token){
            return res.status(403).send({status:false, message:'authentication token missing'})
        }
        const decodedToken = jwt.verify(token, 'secretkey')
        if(decodedToken){
            req.roleType = decodedToken.roleType
            next()
        }
        else{
            return res.status(403).send({status:false, message:'Invalid token'})
        }
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = {authorisation}
