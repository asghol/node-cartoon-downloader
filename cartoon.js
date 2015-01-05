var http = require('http');
var url = require('url');
var fs = require('fs');

var SCRIPTURL = 'http://www.dagbladet.no/tegneserie/pondusarkiv/serveconfig.php?';
var STRIP = 'lunch';
var date = new Date();
var reqUrl = SCRIPTURL + 'date=' + getTime(date) + '&strip=' + STRIP;
var filename = getFilename(date);

getCartoonLocation(reqUrl);

function getCartoonLocation(url) {
  http.get(url, function(res) {
    console.log(res.headers.location);
    getCartoonData(res.headers.location);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function getCartoonData(rawUrl) {
  var urlObj = url.parse(rawUrl);
  console.log(urlObj);
  http.get(urlObj, function(res) {
    fs.exists('./strips/' + STRIP, function(exists) {
      if (exists) {
        writeData(res);
      } else {
        fs.exists('./strips', function(exists) {
          if (exists) {
            fs.mkdir('./strips/' + STRIP, function() {
              writeData(res);
            });
          } else {
            fs.mkdir('./strips', function() {
              fs.mkdir('./strips/' + STRIP, function() {
                writeData(res);
              });
            });
          }
        })

      }
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function writeData(res) {
  var file = fs.createWriteStream('./strips/' + STRIP + '/' + filename);
  res.on('data', function(data) {
    file.write(data);
  }).on('end', function() {
    file.end();
    console.log(filename + ' downloaded');
  });
}

function getTime(date) {
  date = date.getTime() / 1000;
  return Math.floor(date);
}

function getFilename(dateObj) {
  var filename = dateObj.getFullYear() + '.';
  var month = dateObj.getMonth()+1;
  filename += month < 10 ? '0'+month : month;
  filename += '.';
  var dateInMonth = dateObj.getDate();
  filename += dateInMonth < 10 ? '0'+dateInMonth : dateInMonth;
  filename += '.png';
  return filename;
}