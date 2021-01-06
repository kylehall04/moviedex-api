require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const movies = require('./movies-data-small.json');

const app = express();
const API_TOKEN = process.env.API_TOKEN;
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());
app.use(validateBearer);

function validateBearer(req, res, next) {
  const authVal = req.get('Authorization') || '';
  //verifying bearer token header
  if (!authVal.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }
  //verifying token matches our secret token
  const token = authVal.split(' ')[1];
  if (token !== API_TOKEN) {
    return res.status(401).json({ message: 'Invalid credential' });
  }
  //all validation passes, move to next miiddleware
  next();
}

app.get('/movie', function handleGetMovie(req, res) {
  let { genre, country, avg_vote } = req.query;
  let results = movies;
  if (genre) {
    results = results.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  if (country) {
    results = results.filter((movie) =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  if (avg_vote) {
    results = results.filter((movie) => {
      return Number(movie.avg_vote) >= Number(avg_vote);
    });
  }
  res.json(results);
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);
