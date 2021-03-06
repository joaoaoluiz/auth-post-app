const router = require('express').Router()
const verify = require('../middlewares/verifyToken')
const pagination = require('../middlewares/pagination')
const multer = require('multer')
const multerConfig = require('../config/multer')

const userController = require('../controllers/userController')
const imageController = require('../controllers/imageController')

router.get('/', userController.index)
router.get('/profile', verify, userController.profile)
router.post('/register', userController.store)
router.get('/suggest', verify, userController.suggest)


router.post('/search', userController.searchBody, pagination)
router.post('/image', multer(multerConfig).single('photo'), imageController.store)
router.get('/image', imageController.index)
router.delete('/image/:id', imageController.delete)

router.get('/:id', userController.search)
router.delete('/:id', userController.delete)
router.patch('/:id', userController.update)
router.post('/login', multer(multerConfig).single('photo'), userController.login)
router.patch('/follow/:id', verify, userController.follow)
router.patch('/unfollow/:id', verify, userController.unfollow)

module.exports = router