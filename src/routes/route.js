const express = require('express');
const router = express.Router();

const accountController=require('../controllers/accountController')
const middleware=require('../middlewares/authorisation')

router.post('/login', accountController.login)
router.post('/users',middleware.authorisation, accountController.createAccount )
router.get('/users',middleware.authorisation, accountController.getList )


module.exports = router;   