const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');

const app = express();

const MONGODB_URI = 'mongodb+srv://amirhosein:amirhosein@cluster0.ykhje.mongodb.net/SocialNetwork?retryWrites=true&w=majority';

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet()); // adds secure headers to requests.
app.use(compression()); // compress assets to reduce css file size
app.use(morgan('combined', { stream: accessLogStream })); // add logs of requests to access.log file according to above configs

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); //because graphql does not accept OPTIONS method(only POST and GET)
  }
  next();
});

app.use(auth);

// *** Because the image upload cannot be handled by graphql(it supports only json data), we should create a Rest request for uploading image beside graphql endpoints ***
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
});

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err) {
    if (!err.originalError) {
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error occurred';
    const code = err.originalError.code || 500;
    return { message: message, status: code, data: data };
  }
}));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};