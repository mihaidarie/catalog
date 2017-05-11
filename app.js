var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser');
var mv = require('mv');

var photosFolder = '/catalog/images/gallery/';
var photoClientPath = '/images/gallery/';

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
  var accounts = JSON.parse(fs.readFileSync("/catalog/database/accounts/accounts.json"));
  
  var settingsDocResult = [];
  var accountsResult = [];

  var adminEmail = "";
  for (var i = 0, len = accounts.length; i < len; i++) {
    var accountType = accounts[i].AccountType;
    if(accountType == 'admin') {
      adminEmail = accounts[i].Email;
    }
  }

  if(adminEmail != "") {
    var transporter = setupTransporter(settingsDoc.Service, settingsDoc.Username, settingsDoc.Password);
    var mailDetails = createEmailMessage(firstname, lastname, email, subject, body, adminEmail);
    
    // send mail with defined transport object
    transporter.sendMail(mailDetails, (error, info) => {
        if (error) {
            return console.log(error);
        }

        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }
}

function createEmailMessage(firstname, lastname, email, subject, body, adminEmail) {
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
      // ,html: '<b>Iti sugerez sa dai jos site-ul!!!</b>' // html body
  };

  return mailOptions;
}

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/FileUpload.html'));
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
    }
  }

  fs.writeFileSync(classesFilePath, JSON.stringify(classDetails));
  res.sendStatus(200);
});

// handler for getting gallery phothos paths
app.get('/gallery', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var photosList = [];

    var files = fs.readdirSync(photosFolder);

    if(files) {
      files.forEach(file => {
        photosList.push(photoClientPath + file);
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

app.post('/upload', function(req, res) {

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.profileUploadDir = path.join(__dirname, '/images/profiles/large');
  form.galleryUploadDir = path.join(__dirname, photoClientPath);

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
      
      //fs.rename(file.path, newFilePath);

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