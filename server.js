const express = require('express');
const path = require('path');
const files = require('fs');
const utility = require('util');
const readFile = utility.promisify(files.readFile);
const writeFile = utility.promisify(files.writeFile);
const { v4: uniqueId } = require('uuid');
const App = express();
const PORT = process.env.PORT || 3002;

//Middleware
App.use(express.json());
App.use(express.static('public'));
App.use(express.urlencoded({extended:false}));

//Read datebase file and parse it using json
const findNotes = () => {
  return readFile('db/db.json', 'utf-8')
  .then(baseNotes => [].concat(JSON.parse(baseNotes)))
}


//GET Route for home page
App.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//Get Route for notes page
App.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);


//Display notes
App.get('/api/notes', (req, res) => {
    findNotes()
    .then(notes => res.json(notes))
    .catch(err => res.status(400).json(err))
    });
    
//Updating notes request
App.post('/api/notes', ({body}, res) => {
    findNotes()
    .then(currentNotes => {
    const newNotes = [...currentNotes, {title: body.title, text: body.text, id: uniqueId()}]
    writeFile('db/db.json', JSON.stringify(newNotes))
    .then(() => res.json({msg: 'ok'}))
    .catch(err => res.status(400).json(err))
    })
})

//Bonus
App.delete('/api/notes/:id', (req, res) => {
    findNotes().then(currentNotes => {
      let newNotes = currentNotes
      .filter(note => note.id !== req.params.id)
      writeFile('db/db.json', JSON.stringify(newNotes))
      .then(() => res.json({msg: 'ok'}))
      .catch(err => res.status(400).json(err))
    })
  })

App.listen(PORT, () => console.log(`App port: ${PORT}!`));