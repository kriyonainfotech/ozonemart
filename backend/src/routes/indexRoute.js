const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoute'))

module.exports = router;