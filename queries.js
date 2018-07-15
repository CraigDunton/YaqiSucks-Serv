
var promise = require('bluebird')

var options = {
  //Initialization options
  promiseLib: promise,
  error: function(error, e){
    if(e.cn){
      //connection related error
      console.log("CN: ",e.cn);
      console.log("EVENT:", error.message);
    }
  }
};

var pgp = require('pg-promise')(options);
pgp.pg.defaults.poolSize = 20; // free heroku postgres max num of connections
//const connectionString = 'postgres://postgres:stallions@localhost:5432/app';
const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

//query functions
function getAllUsers(req, res, next){
  db.any('select * from users')
    .then(function (data){
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retreived all users'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAllOrgs(req, res, next){
  db.any('select * from orgs')
    .then(function (data){
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retreived all orgs'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSingleUser(req, res, next) {
  var userId = parseInt(req.params.id);
  db.one('select * from users where ID = $1',userId)
    .then(function (data){
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retreived ONE user'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function createUser(req, res, next) {
  db.one('insert into users(fName,lName,email,pw,phone,sched,orgCode)' +
        'values(${fName}, ${lName}, ${email}, ${pw}, ${phone}, ${sched}, ${orgCode})' +
        ' RETURNING id',
          req.body)
    .then(function (data){
      return res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one user',
          data: data.id
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function createOrg(req, res, next) {
  db.one('insert into orgs(name,code)' +
        'values(${orgName}, ${orgCode})' +
        ' RETURNING id',
          req.body)
    .then(function (data){
      return res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one org',
          data: data.id
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateUser(req, res, next) {
  db.none('update users set fName=$1, lName=$2, email=$3, pw=$4, phone=$5, sched=$6, orgCode=$7 where ID=$8',
      [req.body.fName, req.body.lName, req.body.email, req.body.pw, req.body.phone, req.body.sched,
      req.body.orgCode, parseInt(req.params.id)])
    .then(function (){
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated one user'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeUser(req, res, next) {
  var userId = parseInt(req.params.id);
  db.result('delete from users where ID = $1',userId)
    .then(function (result){
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount} user'
        });
      /* jshint ignore:end*/
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateSched(req, res, next) {
  db.none('update users set sched=$1 where ID=$2',
      [req.body.sched, parseInt(req.params.id)])
    .then(function (){
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated one user'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function verifyUser(req, res, next) {
  db.result('select id from users where email=$1 AND pw=$2',
      [req.body.email, req.body.pw])
    .then(function (result){
      var id = -1;
      if(result.rowCount>0){
        id = result.rows[0].id;
      }
      res.status(200)
        .json({
          status: 'success',
          data: id,
          message: 'Verification complete'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function matchUser(req, res, next) {
  db.result('select * from users where orgCode = $1 AND id != $2 AND id NOT IN (select mid from users_met where uid = $2) AND id NOT IN (select mid from users_meeting where uid = $2)',
      [req.body.orgCode, req.body.uid])
    .then(function (result){
      var id = -1;
      if(result.rowCount>0){
        var match={};
        //returns 1 user right now
        //possibility to iterate through all though
        id = result.rows[0].id;
        var fName = result.rows[0].fname;
        var lName = result.rows[0].lname;
        var email = result.rows[0].email;
        var phone = result.rows[0].phone;
        var sched = result.rows[0].sched;
        match = {
          id,
          fName,
          lName,
          email,
          phone,
          sched
        };
        console.log("match: ", match)
        db.none('insert into users_meeting(uid,mid) values($1, $2)',[req.body.uid, id])
          .then(function (result) {
            console.log('successfully put into users meeting table')
          })
          .catch(function (err) {
            console.log('error with insert into users_meeting '+err.message)

          });
      } else {
        var error = "Couldn't match you. Sorry!";
      }
      res.status(200)
        .json({
          status: 'success',
          data: match,
          error,
          message: 'Matching complete'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

 //insert into orgs(name,code)' +
  //    'values(${orgName}, ${orgCode})' +
//  ' RETURNING id

function metUser(req, res, next) {
  db.none('insert into users_met(uid,mid) values($1,$2)',[req.body.uid,req.body.mid])
    .then(function (result) {
      console.log('successfully put into users met table')
    })
    .catch(function (err) {
      console.log('error with insert into users_met '+err.message)
    });

  db.none('delete from users_meeting where uid=$1 and mid=$2',[req.body.uid,req.body.mid])
    .then(function (result) {
      console.log('successfully removed from users meeting table')
    })
    .catch(function (err) {
      console.log('error with remove from users_meeting '+err.message)
    });


  //   //see if they can meet anyone else
  // db.result('select * from users where orgCode = $1 AND id != $2 AND id NOT IN (select mid from users_met where uid = $2) AND id NOT IN (select mid from users_meeting where uid = $2)',
  //     [req.body.orgCode, req.body.uid])
  //   .then(function (result){
  //     var id = -1;
  //     if(result.rowCount>0){
  //       var match={};
  //       //returns 1 user right now
  //       //possibility to iterate through all though
  //       id = result.rows[0].id;
  //       var fName = result.rows[0].fname;
  //       var lName = result.rows[0].lname;
  //       var email = result.rows[0].email;
  //       var phone = result.rows[0].phone;
  //       var sched = result.rows[0].sched;
  //       match = {
  //         fName,
  //         lName,
  //         email,
  //         phone,
  //         sched
  //       };
  //       console.log("match: ", match)
  //     } else {
  //       var error = "Couldn't match you. Sorry!";
  //     }
  //     res.status(200)
  //       .json({
  //         status: 'success',
  //         data: match,
  //         error,
  //         message: 'Matching complete'
  //       });
  //   })
  //   .catch(function(err) {
  //     return next(err);
  //   });
}

// Add functions here so they are available in index.js
module.exports = {
  getAllUsers: getAllUsers,
  getSingleUser: getSingleUser,
  createUser: createUser,
  updateUser: updateUser,
  removeUser: removeUser,
  updateSched: updateSched,
  verifyUser: verifyUser,
  matchUser: matchUser,
  metUser: metUser,
  getAllOrgs: getAllOrgs,
  createOrg: createOrg
};
