const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const epilogue = require('epilogue')
const morgan = require('morgan');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require('./config')

let app = express();

app.set('superSecret', config.secret); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

// route to authenticate a user
app.post('/auth', function(req, res) {
  // find the user
    User.findOne({ where: {username: req.body.username }}).then(user => {
    if (!user) {
	  res.status(403).json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
	    
	  //check if password was submitted
	  if (!req.body.password) {
        res.status(403).send({ success: false, message: 'Authentication failed. No password submitted.' });
	  } else 
      // check if password matches
      if(!bcrypt.compareSync(req.body.password, user.password)) {
	      res.status(403).send({ success: false, message: 'Authentication failed. Wrong password.' });
	  } else {

        // if user is found and password is right
		// create a token with only our given payload
		// we don't want to pass in the entire user since that includes the password
		const payload = {
          permissions: user.permissions,
          name: user.name,
          firstname: user.firstname
        }
		var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: "24h" // expires in 24 hours
        })

        console.log('user: ' + user.username + ' sucessfully logged in')  
		
		// return the information including token as JSON
		res.status(200).send({ success: true, message: 'Authentication success.', token: token });
		
      } // else (password)   
    } // if (user)
  }); // User.findeOne, function
}); // route

// check every request if it has an authorization header
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return next(new Error('Authorization header is required'))
  }
  token = req.get("Authorization").split("Bearer ")[1]
  
  jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
	    // Fehlermedlung erstmal auskommentiert  
	    //return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
	    next();
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
  })
})

// Helper function to authorize User with his token // TODO: authorize different permissions!
function authorize(req, res, next) {
  // check header or url parameters or post parameters for token
  token = req.get("Authorization").split("Bearer ")[1]
  // decode token
  if (token != 'undefined') {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
	    return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ success: false, message: 'No token provided.' });
  }
}

// route to get active user credentials
app.get('/activeUser', function(req, res) {
  // check header or url parameters or post parameters for token
  token = req.get("Authorization").split("Bearer ")[1]	
  // decode token
  if (token != 'undefined') {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
	    console.log(err)
	    return null
      } else {
        // if everything is good, return decoded token
        res.status(200).send(decoded)
      }
    });
  } else {
    // if there is no token return null
    console.log('no token provided xxx')
    //return null
    res.status(200).send(null)
  }
});

// connect to database
let database = new Sequelize(config.database.name, config.database.user, config.database.password, {
  host: config.database.host,
  dialect: config.database.dialect
})

// Checking connection status
database
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

// Define User model
let User = database.define('users', {
  username: { 
	  type: Sequelize.STRING, 
	  unique: {
        args: true,
        msg: 'This username id is already registered.'
      },
      allowNull: false }, 
  name: { type: Sequelize.STRING },
  firstname: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  permissions: { 
    type: Sequelize.STRING, 
    get: function() {
      return JSON.parse(this.getDataValue('permissions'));
    }, 
    set: function(val) {
      return this.setDataValue('permissions', JSON.stringify(val));
    }
  },
  }, 
  {charset: 'utf8',collate: 'utf8_unicode_ci'}
)	

// wenn user angelegt wird, muss das initiale Passwort gehasht werden
User.beforeCreate((user, options) => {
    return bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
        })
        .catch(err => { 
            throw new Error(); 
        });
});


// Define Patient model
let Patient = database.define('patients', {
  name: { type: Sequelize.STRING },
  firstname: { type: Sequelize.STRING },
  birthdate: { type: Sequelize.STRING },
  phone: { type: Sequelize.STRING },
  mobile: { type: Sequelize.STRING },
  insurance: { type: Sequelize.STRING },
  diagnosis: { type: Sequelize.STRING },
  procedure: { type: Sequelize.STRING },
  echo: { type: Sequelize.STRING },
  referrer: { type: Sequelize.STRING },
  notes: { type: Sequelize.TEXT }
})

// Init tables if not existent and fill up primary user
database.sync()

// DEV / DEBUG !!! update or create hardcoded user:
User
  .findOrCreate({where: {id: 1}, defaults: {
	    username: 'admin',
        name: 'Mustermann',
        firstname: 'Max',
        email: 'a@abc.de',
        password: bcrypt.hashSync('123123', 5),
        permissions: {'users' : true, 'posts' : true, 'admin' : true }}
  })
  .spread((user, created) => {
    console.log(user.get({
      plain: true
    }))
    if (!console.log(created)) {
	     user.updateAttributes({
	       username: 'admin',
           name: 'Mustermann',
           firstname: 'Max',
           email: 'a@a.de',
           password: bcrypt.hashSync('123123', 5),
           permissions: {'users' : true, 'posts' : true, 'admin' : true }})
         console.log('User admin updated successfully')
    }
  }) 
  .catch(err => {
    console.log(err)
  })

Patient
  .findOrCreate({where: {id: 1}, defaults: {
        name: 'Tester',
        firstname: 'Thomas'}
  })
  .spread((patient, created) => {
    console.log(patient.get({
      plain: true
    }))
    if (!console.log(created)) {
	     patient.updateAttributes({
           name: 'Tester',
           firstname: 'Thomas'})
         console.log('Patient tester updated successfully')
    }
  }) 
  .catch(err => {
    console.log(err)
  })


// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: database
})

// Create the dynamic REST resources for our Post model
let postResource = epilogue.resource({
  model: Patient,
  endpoints: ['/patients', '/patients/:id']	
})

let userResource = epilogue.resource({
  model: User,
  endpoints: ['/users', '/users/:id']	
})

// protecting the User-resource
userResource.all.auth(function (req, res, context) {
  return new Promise(function(resolve, reject) {
    authorize(req, res, function (err) {
      if (err) {
        // Middleware function returned an error; this means the operation
        // should not be authorized.
        res.status(401).send({message: "Unauthorized"})
        resolve(context.stop)
      } else {
        resolve(context.continue)
      }
  })
})
})
  
// launches the backend on :61015
database
  .sync({ force: false })
  .then(() => {
    app.listen(61015, () => {
      console.log('backend is listening to port localhost:61015')
    })
  })
  