const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/signup',userController.postSignUp)
router.post('/login',userController.postLogin)
router.get('get-current-user/:id',authMiddleware,userController.getCurrentUser)

module.exports = router 