var express = require('express')
var path = require('path')
var app = express()
var bodyParser = require('body-parser')
var PythonShell = require('python-shell')

var htmlRoot = path.join(__dirname, 'public')

app.use('/', express.static(htmlRoot))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  console.log('sending homepage')
  res.status(200).sendFile(htmlRoot + '/' + 'index.html')
})

app.post('/process', function (req, res) {
  console.log('processing request...')
  // console.log(req.body)
  var pyshell = new PythonShell('sample.py', {mode: 'json'})
  var output = ''
  pyshell.stdout.on('data', function (data) {
    output += '' + data
  })

  pyshell.send(req.body).end(function (err) {
    if (err) console.log(err)
    console.log(JSON.parse(output))
    res.status(200).send('{status: 200}')
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
