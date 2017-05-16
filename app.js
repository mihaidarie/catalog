var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser');
var mv = require('mv');
var timer = require('timers');
var uuid = require('uuid');
var SHA3 = require("crypto-js/sha3");

var photosFolder = '/catalog/images/gallery/';
var photoClientPath = '/images/gallery/';
var projectsFolder = '/Catalog/images/projects/';
var projectsClientPath = '/images/projects/';
var newsFilePath = '/catalog/database/news/news.json';
var projectsFilePath = '/catalog/database/projects/projects.json';
var accountsFilePath = "/catalog/database/accounts/accounts.json";

function createLogins() {
  
}

'use strict';
const nodemailer = require('nodemailer');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(path.join(__dirname, '')));

function setupTransporter(service, user, password) {

  //todo: read mail account from app config

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      service: 'Yahoo',
      auth: {
          user: 'mihai_darie2@yahoo.com',
          pass: 'Maymay2017'
      }
  });

  return transporter;
}

function sendMailToAdmin(firstname, lastname, email, subject, body) {
  var settingsDoc = JSON.parse(fs.readFileSync("/catalog/database/appconfig.json"));
  var accounts = JSON.parse(fs.readFileSync(accountsFilePath));
  
  var settingsDocResult = [];
  var accountsResult = [];

  var adminEmail = "";
  for (var i = 0, len = accounts.length; i < len; i++) {
    var accountType = accounts[i].AccountType;
    if(accountType == 'admin') {
      adminEmail = accounts[i].Email;
      break;
    }
  }

  if(adminEmail != "") {
    var transporter = setupTransporter(settingsDoc.Service, settingsDoc.Username, settingsDoc.Password);
    var mailDetails = createSuggestionEmailMessage(firstname, lastname, email, subject, body, adminEmail);
    
    // send mail with defined transport object
    transporter.sendMail(mailDetails, (error, info) => {
        if (error) {
            return console.log(error);
        }

        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }
}

function createSuggestionEmailMessage(firstname, lastname, email, subject, body, adminEmail) {
  // setup email data with unicode symbols
  var friendlyName= '"' + firstname + ' ' + lastname + '"';
  var mailForBody = friendlyName + ' ' + email;
  var from =  friendlyName + ' ' + adminEmail;
  var bodyHeader = "Ati primit o sugestie de la " + mailForBody + "\r\n\r\n";

  let mailOptions = {
      from: from, // sender address
      to: adminEmail, // list of receivers
      subject: subject, // Subject line
      text: bodyHeader + body, // plain text body
      replyTo: email
      // ,html: bodyHeader + body // html body
  };

  return mailOptions;
}

function sendMailToUser(email, subject, body) {
  var settingsDoc = JSON.parse(fs.readFileSync("/catalog/database/appconfig.json"));
  var accounts = JSON.parse(fs.readFileSync(accountsFilePath));
  
  var settingsDocResult = [];

  var adminEmail = "";
  for (var i = 0, len = accounts.length; i < len; i++) {
    var accountType = accounts[i].AccountType;
    if(accountType == 'admin') {
      adminEmail = accounts[i].Email;
      break;
    }
  }

  if(adminEmail != "") {
    var transporter = setupTransporter(settingsDoc.Service, settingsDoc.Username, settingsDoc.Password);
    var mailDetails = createPasswordResetEmailMessage(email, subject, body, adminEmail);
    
    // send mail with defined transport object
    transporter.sendMail(mailDetails, (error, info) => {
        if (error) {
            return console.log(error);
        }

        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }
}

function createPasswordResetEmailMessage(emailTo, subject, body, adminEmail) {
  // setup email data with unicode symbols
  var from =  'Administrator ' + adminEmail;

  let mailOptions = {
      from: from, // sender address
      to: emailTo, // list of receivers
      subject: subject, // Subject line
      //text: bodyHeader + body, // plain text body
      replyTo: adminEmail,
      html: body // html body
  };

  return mailOptions;
}

function compareIds(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }

  // a must be equal to b
  return 0;
}

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/Index.html'));
});

function scheduleTokenRemoval(token) {
  var timeoutInterval = 1 * 60 * 1000;
  setTimeout(function() {
    console.log("invalidating password reset link for token: " + token);
    var resetAttempt = passwordResetTokens[token];
    if(resetAttempt) {
      delete passwordResetTokens[token];
    }
  }, timeoutInterval);
}

var passwordResetTokens = [];

function findPersonByEmail(email, className) {
  var classPersons = JSON.parse(fs.readFileSync("/catalog/database/classes/" + className + ".json"));
  var personDetails = {};

  for (var i = 0, len = classPersons[0].Profiles.length; i < len; i++) {
    var currentPerson = classPersons[0].Profiles[i];
    var personEmail = currentPerson.Email;
    if(email == personEmail) {
      personDetails = currentPerson;
      break;
    }
  }

  return personDetails;
}

app.post('/validateCredentials', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var className = '';
  var profileId = '';

  var accountsContent = fs.readFileSync(accountsFilePath);
  var accounts = JSON.parse(accountsContent);

  var isValid = false;
  for (var i = 0, len = accounts.length; i < len; i++) {
    var currentUsername = accounts[i].Username;
    var currentPassword = accounts[i].Password;
    if(username == currentUsername && password == currentPassword) {
      isValid = true;
      className = accounts[i].Class;
      profileId = accounts[i].Id;
      break;
    }
  }

  var returnMessage = {
    isValid: isValid,
    className: className,
    profileId: profileId
  };

  res.json(JSON.stringify(returnMessage));
});

app.post('/sendResetPassword', function(req, res) {
  var email = req.body.email;
  var className = req.body.className;
  var returnMessage;

  if(email && email != '' && className && className != '') {
    var personDetails = findPersonByEmail(email, className);

    var subject = "Resetare parola";
    var body = "<html>Salut " + personDetails.FirstName + " " + personDetails.LastName + ",\n";
    var passwordResetToken = uuid.v1();

    var passwordResetAttempt = {
      personId: personDetails.Id,
      className: className
    };

    try {
      passwordResetTokens[passwordResetToken] = passwordResetAttempt;

      body = body + "\nAici e link-ul pentru resetarea parolei: <a href='http://localhost:3000/PasswordReset.html?token=" + passwordResetToken + "'>Resetare parola</a></html>"
      sendMailToUser(email, subject, body);
    }
    catch(ex){
      console.log(ex);
    }

    scheduleTokenRemoval(passwordResetToken);

    returnMessage = {
      isValid: true
    };
  } else {
    // send missing details response
    returnMessage = {
      isValid: false,
      message: 'Email incorect sau clasa incorecta, nu exista in baza de date.'
    };
  }

  // res.setHeader('Content-Type', 'application/json');
  // res.sendStatus(200);
  // res.write(JSON.stringify(returnMessage));

  res.json(JSON.stringify(returnMessage));
});

app.post('/resetPassword', function(req, res){
  var newPassword = req.body.newPassword;
  var token = req.body.token;

  var tokenDetails = passwordResetTokens[token];
  var returnResult;

  if(tokenDetails) {
    var personId = tokenDetails.personId;
    var className = tokenDetails.className;
    var accountsContent = fs.readFileSync(accountsFilePath);
    var accounts = JSON.parse(accountsContent);

    for (var i = 0, len = accounts.length; i < len; i++) {
      var currentPersonId = accounts[i].Id;
      var currentPersonClass = accounts[i].Class;
      if(className == currentPersonClass && personId == currentPersonId) {
        accounts[i].Password = newPassword;
        break;
      }
    }

    fs.writeFileSync(accountsFilePath, JSON.stringify(accounts));
    returnResult = {
      success: true
    };
  } else {
    returnResult = {
      success: false,
      message: 'Token-ul a expirat. Reincercati resetarea.'
    };
  }

  // res.setHeader('Content-Type', 'application/json');
  // res.sendStatus(200);
  // res.write(JSON.stringify(returnResult));

  res.json(JSON.stringify(returnResult));
});

// handler for sending suggestions to administrator
app.post('/emailadmin', function(req, res){
  var firstname = req.query.firstname;
  var lastname = req.query.lastname;
  var email = req.query.email;
  var subject = req.query.subject;
  var body = req.body.emailBody;

  sendMailToAdmin(firstname, lastname, email, subject, body);
});

app.post('/saveContacts', function(req, res){
  var body = req.body;
  
  var contactsFilePath = '/catalog/database/contacts/contacts.json';
  fs.writeFileSync(contactsFilePath, JSON.stringify(body));
  res.sendStatus(200);
});

app.post('/saveNews', function(req, res) {
  var parsedNews = req.body;

  parsedNews.existingData.sort(compareIds);

  if(parsedNews.newData) {
    var newNews = parsedNews.newData;
    var lastId = 0;
    if(parsedNews.existingData.length > 0) {
      lastId = parsedNews.existingData[parsedNews.existingData.length - 1].Id;
    }
    
    var newNewsItem = {
      Id : lastId + 1,
      Description : newNews
    };

    parsedNews.existingData.push(newNewsItem);
  }

  var postedNews = JSON.stringify(parsedNews.existingData);

  fs.writeFileSync(newsFilePath, postedNews);
  res.sendStatus(200);
});

app.post('/removeNews', function(req, res) {
  var postedNews = req.body;

  var itemsToRemove = [];
  var newsFileContent = fs.readFileSync(newsFilePath);
  var newsArray = JSON.parse(newsFileContent); 

  newsArray.forEach(currentItem => {
      postedNews.forEach(itemToRemove => {
        if(currentItem.Id == itemToRemove) {
          itemsToRemove.push(currentItem);
        }  
      });
    });

  itemsToRemove.forEach(itemToRemove => {
    var index = newsArray.indexOf(itemToRemove);
    newsArray.splice(index, 1);
  });

  fs.writeFileSync(newsFilePath, JSON.stringify(newsArray));
  res.sendStatus(200);
});

app.post('/saveProjects', function(req, res) {
  var postedProjects = req.body;

  postedProjects.existingData.sort(compareIds);

  if(postedProjects.newData) {
    var newProject = postedProjects.newData;
    var lastId = 0;
    if(postedProjects.existingData.length > 0) {
      lastId = postedProjects.existingData[postedProjects.existingData.length - 1].Id;
    }
    
    var newProjectItem = {
      Id : lastId + 1,
      Title : newProject.Title,
      Subtitle: newProject.Subtitle,
      Description : newProject.Description
    };

    postedProjects.existingData.push(newProjectItem);
  }

  var postedProjectsJson = JSON.stringify(postedProjects.existingData);

  fs.writeFileSync(projectsFilePath, postedProjectsJson);
  res.sendStatus(200);

});

app.post('/removeProjects', function(req, res) {
  var postedProjects = req.body;

  var itemsToRemove = [];
  var projectsFileContent = fs.readFileSync(projectsFilePath);
  var projectsArray = JSON.parse(projectsFileContent); 

  projectsArray.forEach(currentItem => {
      postedProjects.forEach(itemToRemove => {
        if(currentItem.Id == itemToRemove) {
          itemsToRemove.push(currentItem);
        }  
      });
    });

  itemsToRemove.forEach(itemToRemove => {
    var index = projectsArray.indexOf(itemToRemove);
    projectsArray.splice(index, 1);
  });

  fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray));
  res.sendStatus(200);
});

app.post('/validateEmailUnicity', function(req, res) {
  var email = req.body.email;
  var profileClass = req.body.profileClass;
  var profileId = req.body.profileId;

  var classesFilePath = '/catalog/database/classes/';
  var allClasses = fs.readdirSync(classesFilePath);

  var isEmailUnique = true;

  for (var i = 0, len = allClasses.length ; i < len; i++) {
    var className = allClasses[i];
    if(className) {
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath + className));

      for (var j = 0, len = classDetails[0].Profiles.length; j < len; j++) {
        var profileDetails = classDetails[0].Profiles[j];
        if(profileDetails.Email == email) {
          if(profileClass + ".json" == className && profileDetails.Id == profileId) {
            continue;
          } else {
            isEmailUnique = false;
            break;
          }
        }
      }

      if(isEmailUnique == false) {
        break;
      }
    }
  }
  
  var result = {
    isEmailUnique: isEmailUnique
  };

  res.send(JSON.stringify(result));
});

app.post('/saveProfile', function(req, res) {
  var postedProfile = JSON.parse(req.body.ProfileDetails);
  var className = req.query.className;
  var classesFilePath = '/catalog/database/classes/' + className + ".json";
  var classDetails = JSON.parse(fs.readFileSync(classesFilePath));

  for (var i = 0, len = classDetails[0].Profiles.length; i < len; i++) {
    var profileDetails = classDetails[0].Profiles[i];
    if(postedProfile.Id == profileDetails.Id) {
        profileDetails.FirstName = postedProfile.FirstName;
        profileDetails.LastName = postedProfile.LastName;
        profileDetails.Phone = postedProfile.Phone;
        profileDetails.Address = postedProfile.Address;
        profileDetails.Country = postedProfile.Country;
        profileDetails.LinkedIn = postedProfile.LinkedIn;
        profileDetails.Facebook = postedProfile.Facebook;
        profileDetails.Occupation = postedProfile.Occupation;
        profileDetails.Email = postedProfile.Email;
        profileDetails.Description = postedProfile.Description;
        profileDetails.Other = postedProfile.Other;

        profileDetails.PhonePublic = postedProfile.PhonePublic;
        profileDetails.AddressPublic = postedProfile.AddressPublic;
        profileDetails.CountryPublic = postedProfile.CountryPublic;
        profileDetails.LinkedInPublic = postedProfile.LinkedInPublic;
        profileDetails.FacebookPublic = postedProfile.FacebookPublic;
        profileDetails.JobPublic = postedProfile.JobPublic;
        profileDetails.EmailPublic = postedProfile.EmailPublic;
        break;
    }
  }

  fs.writeFileSync(classesFilePath, JSON.stringify(classDetails));
  res.sendStatus(200);
});

app.post('/saveClass', function(req, res) {
  var classDescription = req.body.description.trim();
  var className = req.query.className;
  var classesFilePath = '/catalog/database/classes/' + className + ".json";
  var classDetails = JSON.parse(fs.readFileSync(classesFilePath));

  classDetails[0].Description = classDescription;

  fs.writeFileSync(classesFilePath, JSON.stringify(classDetails));
  res.sendStatus(200);
});

// handler for getting gallery phothos paths
app.get('/gallery', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var photosList = [];

    var files = fs.readdirSync(classesFilePath);

    if(files) {
      files.forEach(file => {
        photosList.push(photoClientPath + file);
      });
    }

    res.send(JSON.stringify(photosList));
});

app.get('/getProjectPhotos', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var photosList = [];

    var files = fs.readdirSync(projectsFolder);

    if(files) {
      files.forEach(file => {
        photosList.push(projectsClientPath + file);
      });
    }

    res.send(JSON.stringify(photosList));
});

app.post('/removePhoto', function(req, res) {
  var photoName = req.query.photoName;

  if(photoName != "NoPhoto.png") {
    var photoPath = photosFolder + photoName;

    fs.unlinkSync(photoPath);

    res.sendStatus(200);
  }
});

app.post('/removeProjectPhoto', function(req, res) {
  var photoNames = req.body;
  for (var i = 0, len = photoNames.length; i < len; i++) {
    var photoName = photoNames[i];
    if(photoName != "NoPhoto.png") {
      var photoPath = projectsFolder + photoName;

      fs.unlinkSync(photoPath);

      res.sendStatus(200);
    }
  }
});

app.post('/upload', function(req, res) {

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.profileUploadDir = path.join(__dirname, '/images/profiles/large');
  form.galleryUploadDir = path.join(__dirname, photoClientPath);
  form.projectsUploadDir = path.join(__dirname, projectsClientPath);

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    var providedFileName = file.name;
    var fileExtension = path.extname(providedFileName);

    var uploadType = req.query.type;

    if(uploadType == 'profile') {
      var classParam = req.query.profileClass;
      var profileIdParam = req.query.profileId;
      
      var newFileName = classParam + profileIdParam + fileExtension;
      var newFilePath = path.join(form.profileUploadDir, newFileName);
      
      mv(file.path, newFilePath, function(err) {
        if (err) { throw err; }
        console.log('profile file moved successfully');
      });

      console.log('saved profile foto');
    }

    if(uploadType == 'gallery') {
      var files = fs.readdirSync(photosFolder);
      var numberOfFiles = files.length;
      var newPhotoPath = path.join(form.galleryUploadDir, numberOfFiles + "_" + file.name);

      mv(file.path, newPhotoPath, function(err) {
        if (err) { throw err; }
        console.log('profile file moved successfully');
      });

      console.log('saved gallery foto');
    }

    if(uploadType == 'project') {
      var files = fs.readdirSync(projectsFolder);
      var numberOfFiles = files.length;
      var newPhotoPath = path.join(form.projectsUploadDir, numberOfFiles + "_" + file.name);

      mv(file.path, newPhotoPath, function(err) {
        if (err) { 
          throw err;
        }

        console.log('profile file moved successfully');

        console.log('saved project foto');
      });
    }

    res.sendStatus(200);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});