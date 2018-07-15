var express = require('express');
var router = express.Router();

var db = require('../queries')

router.get('/api/users',db.getAllUsers);
router.get('/api/users/:id',db.getSingleUser);
router.post('/api/users',db.createUser);
router.put('/api/users/:id',db.updateSched);
router.delete('/api/users',db.removeUser);
router.post('/api/verifyUser',db.verifyUser);
router.post('/api/matchUser',db.matchUser);
router.post('/api/metUser',db.metUser);
// for orga
router.get('/api/orgs',db.getAllOrgs);
router.post('/api/orgs',db.createOrg);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
