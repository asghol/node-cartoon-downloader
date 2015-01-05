var http = require('http');
var url = require('url');
var fs = require('fs');

var SCRIPTURL = 'http://www.dagbladet.no/tegneserie/pondusarkiv/serveconfig.php?';
var STRIPROOT = './strips/';
var GUESTFOLDER = STRIPROOT+'gjesteserie/';

var STRIP = process.argv[2];
var STRIPNAME = STRIP;
var isGuestSeries = false;
if (STRIP == null) {
  console.log('ERROR: Pass in the name of the strip');
  process.exit(0);
} else {
  if (STRIP.indexOf('gjesteserie') >= 0) {
    isGuestSeries = true;
    STRIPNAME = STRIP.substring(STRIP.indexOf('/')+1);
  }
}

var date = new Date();
var reqUrl = SCRIPTURL + 'date=' + getTime(date) + '&strip=' + STRIP;
var filename = getFilename(date);


getCartoonLocation(reqUrl);

function getCartoonLocation(url) {
  http.get(url, function(res) {
    var location = res.headers.location;
    if (location) {
      getCartoonData(location);
    } else {
      console.log('ERROR: Could not find location header');
    }
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function getCartoonData(rawUrl) {
  var urlObj = url.parse(rawUrl);
  console.log(urlObj);
  http.get(urlObj, function(res) {
    fs.exists(STRIPROOT, function(exists) {
      if (exists) {
        checkIsGuest(res);
      } else {
        fs.mkdir(STRIPROOT, function() {
          checkIsGuest(res);
        });
      }
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function checkIsGuest(res) {
  if (!isGuestSeries) {
    checkStripFolder(res);
  } else {
    checkStripFolder(res, true);
  }
}

function checkStripFolder(res, isGuest, guestCreated) {
  if (!isGuest) {
    fs.exists(STRIPROOT+STRIP, function(exists) {
      if (exists) {
        writeData(res, STRIPROOT+STRIP);
      } else {
        fs.mkdir(STRIPROOT+STRIP, function() {
          writeData(res, STRIPROOT+STRIP);
        });
      }
    });
  } else {
    if (!guestCreated) {
      fs.exists(GUESTFOLDER, function(exists) {
        if (exists) {
          checkStripFolder(res, true, true);
        } else {
          fs.mkdir(GUESTFOLDER, function() {
            checkStripFolder(res, true, true);
          });
        }
      });
    } else {
      fs.exists(GUESTFOLDER+STRIPNAME, function(exists) {
        if (exists) {
          writeData(res, GUESTFOLDER+STRIPNAME);
        } else {
          fs.mkdir(GUESTFOLDER+STRIPNAME, function() {
            writeData(res, GUESTFOLDER+STRIPNAME);
          });
        }
      });
    }
  }
}

function writeData(res, filepath) {
  var file = fs.createWriteStream(filepath + '/' + filename);
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