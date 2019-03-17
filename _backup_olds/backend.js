const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const epilogue = require('epilogue')
const morgan = require('morgan');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const VueResource = require('vue-resource')
const config = require('./config'); // get our config file

let app = express();
app.use(VueResource);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}))
// secret variable
app.set('superSecret', config.secret); 

// use morgan to log requests to the console
app.use(morgan('dev'))

// authentication routes
app.post('/auth', function(req, res, next) {
  function authentication() {
    console.log("start?");
    return new Promise(function(resolve,reject) {
	  User.findOne({where: {email: req.params.email}})
	  
	  .then(user => {
        // check if user exists
        if (!user) {
	      res.status(400).json({success: false, type: 'error', message: 'invalid_request: user not found'});
        } else if (user) {
	    
        // check if password matches
        if(!bcrypt.compareSync(req.body.password, user.password)) {
	      res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	    } else {
		  
		  // if user is found and password is right
		  // create a token with only our given payload
		  // we don't want to pass in the entire user since that includes the password
		  const payload = {
			  permissions: user.permissions,
			  name: user.name,
			  admin: user.admin 
			  }
		  var token = jwt.sign(payload, app.get('superSecret'), {
			  expiresIn: "24h" // expires in 24 hours
			  })
				 
		  console.log('user: ' + user.name + ' sucessfully logged in')  
		  // return the information including token as JSON
		  res.json({ success: true, message: 'Enjoy your token!', body: {
			  "access_token": token,
              "token_type":"bearer",
              "expires_in":1440,
              "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk",
              "scope":"create"
			  }
		  });
		}  
    }
     }) // then
     .catch(err => {
       console.error('invalid_request: user not found', err);
       reject(err);
  });
})

// TOOOOO.  IMPLEMENT:


// verify JWT token middleware
app.use((req, res, next) => {
	// require every request to have an authorization header
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'];
	
	if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });
    
    } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    }
});

// Basic response on API - for testing
app.get('/', function(req, res) {
    res.send('Hello! This is the unprotected API');
})

let database = new Sequelize(config.database.name, config.database.user, config.database.password, {
  host: config.database.host,
  dialect: config.database.dialect
})

//Checking connection status
database
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Define Post model
let Post = database.define('posts', {
  title: Sequelize.STRING,
  body: Sequelize.TEXT
})

// Define User model
let User = database.define('users', {
  name: Sequelize.STRING,
  username: Sequelize.STRING, 
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  permissions: { 
    type: Sequelize.STRING, 
    get: function() {
      return JSON.parse(this.getDataValue('permissions'));
    }, 
    set: function(val) {
      return this.setDataValue('permissions', JSON.stringify(val));
    }
  }
})

// update hardcoded user:
User
  .findOne({ where: { id: 1 } })
  .then ((user) => {
    user.updateAttributes({
	    username: 'admin',
        name: 'Mustermann',
        permissions: {'users' : true, 'posts' : true}      })
  })
  .catch(err => {
    console.log(err);
  });
  
// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: database
})

// Create the dynamic REST resources for our Post model
let postResource = epilogue.resource({
  model: Post,
  endpoints: ['/posts', '/posts/:id']	
})

let userResource = epilogue.resource({
  model: User,
  endpoints: ['/users', '/users/:id']	
})
  
// launches the backend on :61015
database
  .sync({ force: false })
  .then(() => {
    app.listen(61015, () => {
      console.log('backend is listening to port localhost:61015')
    })
  })
  