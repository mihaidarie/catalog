var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser');
var mv = require('mv');
var timer = require('timers');
var uuid = require('uuid');
var cookieParser = require('cookie-parser');
var sem = require('semaphore')(1);
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var https = require('https');
var http = require('http');

console.log('Catalog server starting...');

var contactsFilePath = path.join(__dirname, '/database/contacts/contacts.json');
var photosFolder = path.join(__dirname, '/images/gallery/');
var photoClientPath = '/images/gallery/';
var projectsFolder = path.join(__dirname, '/images/projects/');
var projectsClientPath = '/images/projects/';
var newsFilePath = path.join(__dirname, '/database/news/news.json');
var projectsFilePath = path.join(__dirname, '/database/projects/projects.json');
var accountsFilePath = path.join(__dirname, "/database/accounts/accounts.json");
var classesFilePath = path.join(__dirname, '/database/classes/');
var recentPhotosPath = '/images/profiles/large/';
var linksFilePath = path.join(__dirname, "/database/links/links.json");
var appconfigFilePath = path.join(__dirname, "/database/appconfig.json");
var appconfig = JSON.parse(fs.readFileSync(appconfigFilePath));
var sitePort = appconfig.ListeningPort;
var sitePortSecured = appconfig.ListeningPortSecured;
var ipAddress = appconfig.IpAddress;
var certificatePath = appconfig.CertificatePath;
var certificatePassword = appconfig.CertificatePassword;

console.log('Catalog server read paths...');

var passwordResetTokens = [];

var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function createLogins() {
  var accounts = JSON.parse(fs.readFileSync(accountsFilePath));
  
  for (var i = 0, len = accounts.length; i < len; i++) {
      var password = accounts[i].Password;
      var hash = crypto.createHash('sha256');
      hash.update(password);
      var hashedPassword = hash.digest('hex');
      console.log(hashedPassword);
      accounts[i].Password = hashedPassword;
  }

  fs.writeFileSync(accountsFilePath, JSON.stringify(accounts));
}

function isDifferentThanAdmin(usernameOrEmail, password) {
  var adminDetails = getAdminDetails();
  var isDifferent = true;
  var adminUser = adminDetails.Username;
  var adminEmail = adminDetails.Email;
  var adminPassword = adminDetails.Password;

  isDifferent = adminEmail != usernameOrEmail || adminPassword != password;
  return isDifferent;
}

'use strict';
const nodemailer = require('nodemailer');
app.use(cookieParser());

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(path.join(__dirname, '')));

// verify connection configuration
function verifyEmailConfiguration(transporter) {
	
	console.log('Verifying transporter setup...');
	
	transporter.verify(function(error, success) {
		if (error) {
			  console.log('Email configuration error: ' + error);
			  configurationOk = false;
		} else {
			  console.log('Email Server is ready to take our messages');
			  configurationOk = true;
		}
	});
  
	console.log('Transporter check finished...');
}

function setupTransporter(serviceHost, servicePort, secured, user, password) {
  var adminEmail = appconfig.SmtpUsername;
  var adminPassword = appconfig.SmtpPassword;
  var service = appconfig.SmtpService;

	console.log('Creating transporter...');
	
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      host: serviceHost,
      port: servicePort,
      secure: secured,
      auth: {
          user: adminEmail,
          pass: adminPassword
      }
  });
  
  
  console.log('Created transporter...');

  verifyEmailConfiguration(transporter);
  
  return transporter;
}

function updateRecentPhotoPath(newFilePath, profileIdParam, classParam) {
  var classFilePath = classesFilePath + classParam + ".json";
  var classDetails = JSON.parse(fs.readFileSync(classFilePath));
  
  for (var i = 0, len = classDetails[0].Profiles.length; i < len; i++) {
    var currentPersonId = classDetails[0].Profiles[i].Id;
    if(currentPersonId == profileIdParam) {
      classDetails[0].Profiles[i].RecentPhotoPath = newFilePath;
      break;
    }
  }

  fs.writeFileSync(classFilePath, JSON.stringify(classDetails));
}

app.get('/exportAllEmails', function(req, res) {
  var allEmails = '';
  var isUserAdmin = isAdminLoggedIn(req);
  
  if(isUserAdmin == true) {
    
    var allClasses = fs.readdirSync(classesFilePath);
    for (var i = 0, classesNumber = allClasses.length ; i < classesNumber; i++) {
      var className = allClasses[i];
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath + className));
      var sortedProfiles = classDetails[0].Profiles.sort(compareProfileIds);
      for (var j = 0, profilesNumber = sortedProfiles.length; j < profilesNumber; j++) {
        var profileDetails = classDetails[0].Profiles[j];
        var email = profileDetails.Email;
        if(email && email != '') {
          allEmails = allEmails + email + '; ';
        }
      }
    }
  }

  var allEmailsResult = {
    EmailsList: allEmails
  };

  res.json(allEmailsResult);
});

function sendMailToAdmin(firstname, lastname, email, subject, body) {
  var settingsDoc = appconfig;
  var accounts = JSON.parse(fs.readFileSync(accountsFilePath));
  
  console.log('Initiating mail sending to admin...');
  
  var settingsDocResult = [];
  var accountsResult = [];

  var adminDetails = getAdminDetails();
  var adminEmail = adminDetails.Email;
  
  if(adminEmail != "") {
	  
	console.log('Retrieved admin email...');
	
    var transporter = setupTransporter(settingsDoc.SmtpServiceHost, settingsDoc.SmptServicePort, settingsDoc.SmptServiceSecured, settingsDoc.Username, settingsDoc.Password);
	
	console.log('Email transporter setup...');
	
    var mailDetails = createSuggestionEmailMessage(firstname, lastname, email, subject, body, adminEmail);
    
	console.log('Attempting to send email to admin...');
	
    // send mail with defined transport object
    transporter.sendMail(mailDetails, (error, info) => {
        if (error) {
            return console.log('Error sending mail: ' + error);
        }

        console.log('Message %s sent to admin: %s', info.messageId, info.response);
    });
  } else {
	  console.log('Admin email is empty, cannot send mail...');
  }
}

function createSuggestionEmailMessage(firstname, lastname, email, subject, body, adminEmail) {
  // setup email data with unicode symbols
  var friendlyName= '"' + firstname + ' ' + lastname + '"';
  var mailForBody = friendlyName + ' ' + email;
  var from =  friendlyName + ' ' + appconfig.SmtpUsername;
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
	var settingsDoc = appconfig;
	var accounts = JSON.parse(fs.readFileSync(accountsFilePath));

	console.log('Initiating email sending to user...');
	
	var settingsDocResult = [];

	var adminDetails = getAdminDetails();
	var adminEmail = adminDetails.Email;

	console.log('Retrieved admin email...');
	
	if(adminEmail != "") {
		var transporter = setupTransporter(settingsDoc.SmtpServiceHost, settingsDoc.SmptServicePort, settingsDoc.SmptServiceSecured, settingsDoc.Username, settingsDoc.Password);
		
		console.log('Email transporter setup...');
	
		var mailDetails = createPasswordResetEmailMessage(email, subject, body, adminEmail);

		console.log('Attempting to send email to user...');

		// send mail with defined transport object
		transporter.sendMail(mailDetails, (error, info) => {
			if (error) {
				return console.log('Error sending mail: ' + error);
			}

			console.log('Message %s sent to user: %s', info.messageId, info.response);
		});
	} else {
	  console.log('Admin email is empty, cannot send mail...');
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

function compareProfileIds(a, b) {
  if (a.Id < b.Id) {
    return -1;
  }
  if (a.Id > b.Id) {
    return 1;
  }

  // a must be equal to b
  return 0;
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

app.get('/getPreviousClassProfile', function(req, res) {
  var currentClassName = req.query.className;
  var currentProfileId = req.query.currentProfileId;
  
  var allClasses = fs.readdirSync(classesFilePath);

  var personDetails = {
    ClassName: '',
    ProfileId: ''
  };

  for (var i = 0, classesNumber = allClasses.length ; i < classesNumber; i++) {
    var className = allClasses[i];
    if(className == currentClassName + ".json") {
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath + className));
      var sortedProfiles = classDetails[0].Profiles.sort(compareProfileIds);
      for (var j = 0, profilesNumber = sortedProfiles.length; j < profilesNumber; j++) {
        var profileDetails = classDetails[0].Profiles[j];
        if(profileDetails.Id == currentProfileId) {
          
          var isLastProfileOfCurrentClass = j == 0;

          if(isLastProfileOfCurrentClass == true) {

            var isLastClass = i == 0;

            if(isLastClass == true) {
              var nextClassName = allClasses[classesNumber - 1];
              var nextClassDetails = JSON.parse(fs.readFileSync(classesFilePath + nextClassName));
              var nextClassProfilesNumber = nextClassDetails[0].Profiles.length;
              personDetails.ProfileId = nextClassDetails[0].Profiles.sort(compareProfileIds)[nextClassProfilesNumber - 1].Id;
              personDetails.ClassName = nextClassName;
            } else {
              var nextClassName = allClasses[i - 1];
              var nextClassDetails = JSON.parse(fs.readFileSync(classesFilePath + nextClassName));
              var nextClassProfilesNumber = nextClassDetails[0].Profiles.length;
              personDetails.ProfileId = nextClassDetails[0].Profiles.sort(compareProfileIds)[nextClassProfilesNumber - 1].Id;
              personDetails.ClassName = nextClassName;
            }
 
          } else {
            personDetails.ProfileId = sortedProfiles[j - 1].Id;
            personDetails.ClassName = className;
          }

          personDetails.ClassName = personDetails.ClassName.replace('.json', '');
          
          break;
        }
      }

      if(personDetails.ClassName != '' && personDetails.ProfileId != '') {
        // navigation profile found
        break;
      }
    }
  }

  res.json(personDetails);
});

app.get('/getNextClassProfile', function(req, res) {
  var currentClassName = req.query.className;
  var currentProfileId = req.query.currentProfileId;
  
  var allClasses = fs.readdirSync(classesFilePath);

  var personDetails = {
    ClassName: '',
    ProfileId: ''
  };

  for (var i = 0, classesNumber = allClasses.length ; i < classesNumber; i++) {
    var className = allClasses[i];
    if(className == currentClassName + ".json") {
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath + className));
      var sortedProfiles = classDetails[0].Profiles.sort(compareProfileIds);
      for (var j = 0, profilesNumber = sortedProfiles.length; j < profilesNumber; j++) {
        var profileDetails = classDetails[0].Profiles[j];
        if(profileDetails.Id == currentProfileId) {
          
          var isLastProfileOfCurrentClass = j == profilesNumber - 1;

          if(isLastProfileOfCurrentClass == true) {

            var isLastClass = i == classesNumber - 1;

            if(isLastClass == true) {
              var nextClassName = allClasses[0];
              var nextClassDetails = JSON.parse(fs.readFileSync(classesFilePath + nextClassName));
              personDetails.ProfileId = nextClassDetails[0].Profiles.sort(compareProfileIds)[0].Id;
              personDetails.ClassName = nextClassName;
            } else {
              var nextClassName = allClasses[i+1];
              var nextClassDetails = JSON.parse(fs.readFileSync(classesFilePath + nextClassName));
              personDetails.ProfileId = nextClassDetails[0].Profiles.sort(compareProfileIds)[0].Id;
              personDetails.ClassName = nextClassName;
            }
 
          } else {
            personDetails.ProfileId = sortedProfiles[j+1].Id;
            personDetails.ClassName = className;
          }

          personDetails.ClassName = personDetails.ClassName.replace('.json', '');
          
          break;
        }
      }

      if(personDetails.ClassName != '' && personDetails.ProfileId != '') {
        // navigation profile found
        break;
      }
    }
  }

  res.json(personDetails);
});

app.get('/getLinks', function(req, res) {
  var links = fs.readFileSync(linksFilePath, 'utf8');
  var returnResult = {
      AllLinks: links
  }
  
  res.json(returnResult);
});

app.post('/saveLinks', function(req, res) {
  sem.take(function() {
      var isUserAdmin = isAdminLoggedIn(req);
      if(isUserAdmin == true) {
        var links = req.body.AllLinks;
        fs.writeFileSync(linksFilePath, links);
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }

      sem.leave();
  });
});

app.post('/isAdmin', function(req, res){
  sem.take(function() {
    var adminId = getAdminDetails().Id;

    var loggedInUserId = req.body.userId;
    var isAdmin = adminId == loggedInUserId;

    var returnMessage = {
      IsAdmin: isAdmin
    };

    res.json(returnMessage);
    sem.leave();
  });
});

function getAdminDetails() {
  var adminDetails;
  var accounts = JSON.parse(fs.readFileSync(accountsFilePath));

  for (var i = 0, len = accounts.length; i < len; i++) {
    var accountType = accounts[i].AccountType;
    if(accountType == 'admin') {
      adminDetails = accounts[i];
      break;
    }
  }

  var contacts = JSON.parse(fs.readFileSync(contactsFilePath));
  adminDetails.Email = contacts.EmailRomania;

  return adminDetails;
}

function scheduleTokenRemoval(token) {
  var timeoutInterval = 5 * 60 * 1000;
  setTimeout(function() {
    console.log("invalidating password reset link for token: " + token);
    var resetAttempt = passwordResetTokens[token];
    if(resetAttempt) {
      delete passwordResetTokens[token];
    }
  }, timeoutInterval);
}

function findPersonByClassAndId(className, personId) {
  var classFilePath = classesFilePath + className + ".json";
  var fileExists = fs.existsSync(classFilePath);

  if(fileExists == true) {
    var classPersons = JSON.parse(fs.readFileSync(classFilePath));
    var personDetails = {};

    for (var i = 0, len = classPersons[0].Profiles.length; i < len; i++) {
      var currentPerson = classPersons[0].Profiles[i];
      var currentPersonId = currentPerson.Id;
      if(currentPersonId == personId) {
        personDetails = currentPerson;
        personDetails.IsFound = true;
        break;
      }
    }
  } else {
    personDetails.IsFound = false;
  }

  return personDetails;
}

function findPersonByEmail(email, className) {
  var classFilePath = classesFilePath + className + ".json";
  var fileExists = fs.existsSync(classFilePath);
  var personDetails = {};
  
  if(fileExists == true) {
    var classPersons = JSON.parse(fs.readFileSync(classFilePath));

    for (var i = 0, len = classPersons[0].Profiles.length; i < len; i++) {
      var currentPerson = classPersons[0].Profiles[i];
      var personEmail = currentPerson.Email;
      if(email == personEmail) {
        personDetails = currentPerson;
        personDetails.IsFound = true;
        break;
      }
    }
  } else {
    personDetails.IsFound = false;
  }

  return personDetails;
}

function getPersonDetailsByMail(email) {
  var allClasses = fs.readdirSync(classesFilePath);

  var personDetails = {
    IsValid: false,
    Class: '',
    UserId: ''
  };

  for (var i = 0, len = allClasses.length ; i < len; i++) {
    var className = allClasses[i];
    if(className) {
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath + className));

      for (var j = 0, len = classDetails[0].Profiles.length; j < len; j++) {
        var profileDetails = classDetails[0].Profiles[j];
        if(profileDetails.Email == email) {
          personDetails.Class = className.replace('.json', '');
          personDetails.UserId = profileDetails.Id;
          personDetails.IsValid = true;
          break;
        }
      }

      if(personDetails.IsValid == true) {
        break;
      }
    }
  }

  return personDetails;
}

app.post('/validateCredentials', function(req, res) {

	console.log('Request for credentials validation received');
	
	sem.take(function() {
		
		console.log('Acquired lock');	
		
		var username = req.body.username;
		var password = req.body.password;
		var className = '';
		var profileId = '';
		var isValid = false;

		if(username && username != '' && password && password != '') {
			var accountsContent = fs.readFileSync(accountsFilePath);
			var accounts = JSON.parse(accountsContent);

			console.log('Read accounts file');	
		
			var personDetails = getPersonDetailsByMail(username);
			
			console.log('Got person details');	
			
			if(personDetails.IsValid == true) {
				console.log('Person details valid');	
				isValid = personDetails.IsValid;
				className = personDetails.Class;
				profileId = personDetails.UserId;
			} else {
				console.log('Person details invalid');	
				for (var i = 0, len = accounts.length; i < len; i++) {
					
					console.log('iteration: ' + i);	
				  var currentUsername = accounts[i].Username;
				  var currentPassword = accounts[i].Password;
				  var hash = crypto.createHash('sha256');
				  hash.update(password);
				  var hashedPassword = hash.digest('hex');
					console.log('computed hash');	
				  if(username == currentUsername && hashedPassword == currentPassword) {
					console.log('login credentials are valid');
					isValid = true;
					className = accounts[i].Class;
					profileId = accounts[i].Id;
					break;
				  }
				}
			}
		}
		var returnMessage = {
		  isValid: isValid,
		  className: className,
		  profileId: profileId
		};

		console.log('returning response');
		res.json(JSON.stringify(returnMessage));  		
		
		console.log('Releasing lock');	
		
		sem.leave();
		
		console.log('Released lock');	
	});
	
	console.log('Credentials validation exit');	
});

app.post('/sendResetPassword', function(req, res) {
  sem.take(function() {
    var email = req.body.email;
    var className = req.body.className;
    var returnMessage;

    if(email && email != '' && className && className != '') {
      var personDetails = findPersonByEmail(email, className);

      if(personDetails.IsFound == true) {
        var subject = "Resetare parola";
        var body = "<html>Salut " + personDetails.FirstName + " " + personDetails.LastName + ",\n";
        var passwordResetToken = uuid.v1();

        var passwordResetAttempt = {
          personId: personDetails.Id,
          className: className
        };

        try {
          passwordResetTokens[passwordResetToken] = passwordResetAttempt;
          
          var incomingRequestUrl = req.headers.referer;
          var host = req.headers.host;
          var portIndex = host.indexOf(":");
          var hostDomain = host;
          if(portIndex >= 0) {
            hostDomain = host.substring(0, portIndex);
          }

          var isSecured = incomingRequestUrl.indexOf('https://') > -1;
          var protocol = "http://";
          var usedPort = sitePort;
          if(isSecured == true) {
            protocol = "https://";
            usedPort = sitePortSecured;
          }

          var siteUrl = protocol + hostDomain + ':'+ usedPort + '/PasswordReset.html?token=' + passwordResetToken;
          body = body + "\nAici e link-ul pentru resetarea parolei: <a href='" + siteUrl + "'>Resetare parola</a></html>"
          sendMailToUser(email, subject, body);
        }
        catch(ex) {
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
    } else {
      // send missing details response
      returnMessage = {
        isValid: false,
        message: 'Email incorect sau clasa incorecta, nu exista in baza de date.'
      };
    }

    res.json(JSON.stringify(returnMessage));
    sem.leave();
  });
});

app.post('/validateResetPasswordToken', function(req, res) {
  sem.take(function() {
    var token = req.body.token;

    var tokenDetails = passwordResetTokens[token];
    var returnResult;

    if(tokenDetails) {
      returnResult = {
        success: true
      };
    } else {
      returnResult = {
        success: false,
        message: 'Token-ul a expirat. Reincercati resetarea.'
      };
    }
    
    res.json(JSON.stringify(returnResult));
    sem.leave();
  });
});

app.post('/resetPassword', function(req, res) {
  sem.take(function() {
    var newPassword = req.body.newPassword;
    var token = req.body.token;

    var tokenDetails = passwordResetTokens[token];
    var returnResult = { success: false };

    if(tokenDetails) {
      var personId = tokenDetails.personId;
      var className = tokenDetails.className;
      var accountsContent = fs.readFileSync(accountsFilePath);
      var accounts = JSON.parse(accountsContent);

      for (var i = 0, len = accounts.length; i < len; i++) {
        var adminId = getAdminDetails().Id;
        var currentPersonId = accounts[i].Id;
        var currentPersonClass = accounts[i].Class;
        
        if(adminId != currentPersonId) {
          if(className.toLowerCase() == currentPersonClass.toLowerCase() && personId == currentPersonId) {
            var hash = crypto.createHash('sha256');
            hash.update(newPassword);
            var hashedPassword = hash.digest('hex');

            var username = accounts[i].Username;
            var personDetails = findPersonByClassAndId(className, personId);
            var email = personDetails.Email;
            var isEmailPasswordDifferentThanAdmin = isDifferentThanAdmin(email, hashedPassword);
            var isUsernamePasswordDifferentThanAdmin = isDifferentThanAdmin(username, hashedPassword);
            
            if(isEmailPasswordDifferentThanAdmin == true && isUsernamePasswordDifferentThanAdmin) {
              accounts[i].Password = hashedPassword;
              returnResult.success = true;
            } else {
              returnResult = {
                success: false,
                message: 'Credentiale folosite deja. Incercati alta parola.'
              };
            }

            break;
          }
        }
      }

      if(returnResult.success == true) {
        fs.writeFileSync(accountsFilePath, JSON.stringify(accounts));
        returnResult = {
          success: true
        };
      }
    } else {
      returnResult = {
        success: false,
        message: 'Token-ul a expirat. Reincercati resetarea.'
      };
    }

    res.json(JSON.stringify(returnResult));
    sem.leave();
  });
});

// handler for sending suggestions to administrator
app.post('/emailadmin', function(req, res) {
	console.log('Received suggestion sending request...');
  sem.take(function() {
    var isCaptchaValid = validateCaptchaCookie(req);
	console.log('Validating captcha...');
    if(isCaptchaValid == true) {
      res.cookie('suggestionsCaptcha', { IsValid: false }, { expires: new Date(Date.now()) });
		console.log('Captcha is valid...');
      var firstname = req.query.firstname;
      var lastname = req.query.lastname;
      var email = req.query.email;
      var subject = req.query.subject;
      var body = req.body.emailBody;

	  console.log('Initiating mail sending to admin...');
      sendMailToAdmin(firstname, lastname, email, subject, body);
      res.sendStatus(200);
    } else {
		console.log('Captcha is invalid...');
      res.sendStatus(401);
    }

    sem.leave();
  });
});

function validateCaptchaCookie(req) {
  var captchaCookie = req.cookies.suggestionsCaptcha;
  if(captchaCookie) {
    console.log('captcha cookie found in request...');
    var captchaCookieValue = JSON.parse(captchaCookie);
    if(captchaCookieValue.IsValid == true) {
	  console.log('captcha found as valid...');
      return true;
    }
  } else {
	  console.log('captcha cookie not found...');
  }

  console.log('captcha return as invalid...');
  return false;
}

app.post('/saveContacts', function(req, res){
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
      var body = req.body;
      
      fs.writeFileSync(contactsFilePath, JSON.stringify(body));
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

app.post('/saveNews', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
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
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

app.post('/removeNews', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
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
    } else {
      res.sendStatus(401);
    }
    
    sem.leave();
  });
});

app.post('/saveProjects', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
      var postedProjects = req.body;

      postedProjects.existingData.sort(compareIds);

      var isTitle = postedProjects.newData.Title && postedProjects.newData.Title != '';
      var isSubtitle = postedProjects.newData.Subtitle && postedProjects.newData.Subtitle != '';
      var isDescription = postedProjects.newData.Description && postedProjects.newData.Description != '';
      
      var isAnyFieldPresent = isTitle || isSubtitle || isDescription;

      if(postedProjects.newData && (isAnyFieldPresent == true)) {
        var newProject = postedProjects.newData;
        var lastId = 0;
        if(postedProjects.existingData.length > 0) {
          lastId = postedProjects.existingData[postedProjects.existingData.length - 1].Id;
        }
        
        var newTitle = newProject.Title;
        if(isTitle == false) {
          newTitle = '';
        }

        var newSubTitle = newProject.Subtitle;
        if(isSubtitle == false) {
          newSubTitle = '';
        }

        var newDescription = newProject.Description;
        if(isDescription == false) {
          newDescription = '';
        }

        var newProjectItem = {
          Id : lastId + 1,
          Title : newTitle,
          Subtitle: newSubTitle,
          Description : newDescription
        };

        postedProjects.existingData.push(newProjectItem);
      }

      var postedProjectsJson = JSON.stringify(postedProjects.existingData);

      fs.writeFileSync(projectsFilePath, postedProjectsJson);
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

app.post('/removeProjects', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
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
        var projectPhotosPath = projectsFolder + itemToRemove.Id + '/';
        if(fs.existsSync(projectPhotosPath)) {
          try{
            rimraf(projectPhotosPath, function () { 
              console.log('removed projects photos folder: ' + projectPhotosPath); 
            });
          }
          catch(error) {
            console.log('failed to remove projects photos folder: ' + projectPhotosPath + "\nerror: " + error);
          }
        }
      });

      fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray));
      res.sendStatus(200);  
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

app.post('/validateEmailUnicity', function(req, res) {
  sem.take(function() {
    var email = req.body.email;
    var profileClass = req.body.profileClass;
    var profileId = req.body.profileId;

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
    
    sem.leave();
  });
});

function isExpectedUser(className, profileId, req) {
  var loginCookie = req.cookies.login;

  if(loginCookie) {
    var parsedLogin = JSON.parse(loginCookie);
    if(parsedLogin.UserId == profileId && parsedLogin.Class == className) {
      return true;
    }
  }

  return false;
}

app.post('/saveProfile', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    var postedProfile = JSON.parse(req.body.ProfileDetails);
    var className = req.query.className;
    var profileId = postedProfile.Id;

    var isExpectedUserLoggedIn = isExpectedUser(className, profileId, req);
    if(isUserAdmin == true || isExpectedUserLoggedIn == true) {
    
      var targetClassFilePath = classesFilePath + className + ".json";
      var classDetails = JSON.parse(fs.readFileSync(targetClassFilePath));

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
            profileDetails.Job = postedProfile.Job;
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

      fs.writeFileSync(targetClassFilePath, JSON.stringify(classDetails));
      res.sendStatus(200);  
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

app.post('/saveClass', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
      var classDescription = req.body.description.trim();
      var className = req.query.className;
      var classesFilePath = classesFilePath + className + ".json";
      var classDetails = JSON.parse(fs.readFileSync(classesFilePath));

      classDetails[0].Description = classDescription;

      fs.writeFileSync(classesFilePath, JSON.stringify(classDetails));
      res.sendStatus(200);  
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

function isAdminLoggedIn(req) {
  var isUserAdmin = false;
  var loggedInDetails = req.cookies.login;
  if(loggedInDetails) {
    var userDetails = JSON.parse(loggedInDetails);
    var adminId = getAdminDetails().Id;
    isUserAdmin = userDetails.UserId == adminId;
  }

  return isUserAdmin;
}

// handler for getting gallery phothos paths
app.get('/gallery', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
  
    var photosList = [];

    var files = fs.readdirSync(photosFolder);

    if(files) {
      files.forEach(file => {
        if(files.length > 1) {
          if(file != 'NoPhoto.png') {
            photosList.push(photoClientPath + file);
          }
        } else {
          photosList.push(photoClientPath + file);
        }
      });
    }

    res.send(JSON.stringify(photosList));
});

app.get('/getProjectPhotos', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var photosList = [];
    var projectId = req.query.projectId;
    var files = fs.readdirSync(projectsFolder + projectId + '/');

    if(files) {
      files.forEach(file => {
        photosList.push(projectsClientPath + projectId + '/' + file);
      });
    }

    res.send(JSON.stringify(photosList));
});

app.post('/removePhoto', function(req, res) {
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
      var photoName = req.query.photoName;

      if(photoName != "NoPhoto.png") {
        var photoPath = photosFolder + photoName;

        fs.unlinkSync(photoPath);

        res.sendStatus(200);
      }
    } else {
      res.sendStatus(401);
    }
    sem.leave();
  });
});

app.post('/removeProjectPhoto', function(req, res) {
  var projectId = req.query.projectId;
  sem.take(function() {
    var isUserAdmin = isAdminLoggedIn(req);
    if(isUserAdmin == true) {
      var photoNames = req.body;
      for (var i = 0, len = photoNames.length; i < len; i++) {
        var photoName = photoNames[i];
        if(photoName != "NoPhoto.png") {
          var photoPath = projectsFolder + projectId + '/' + photoName;

          fs.unlinkSync(photoPath);
        }
      }

      res.sendStatus(200);  
    } else {
      res.sendStatus(401);
    }

    sem.leave();
  });
});

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

app.post('/upload', function(req, res) {
  sem.take(function() {
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.profileUploadDir = path.join(__dirname, recentPhotosPath);
    form.galleryUploadDir = path.join(__dirname, photoClientPath);
    form.projectsUploadDir = path.join(__dirname, projectsClientPath);

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
      var providedFileName = file.name;
      var fileExtension = path.extname(providedFileName);

      var uploadType = req.query.type;

      if(uploadType == 'profile') {
        var isUserAdmin = isAdminLoggedIn(req);
        var classParam = req.query.profileClass;
        var profileIdParam = req.query.profileId;

        var isExpectedUserLoggedIn = isExpectedUser(classParam, profileIdParam, req);
        if(isUserAdmin == true || isExpectedUserLoggedIn == true) {
          
          var newFileName = classParam + profileIdParam + fileExtension;
          var newFilePath = path.join(form.profileUploadDir, newFileName);
          var newFileClientPath = recentPhotosPath + newFileName;
          
          mv(file.path, newFilePath, function(err) {
            if (err) { 
              throw err; 
            }

            updateRecentPhotoPath(newFileClientPath, profileIdParam, classParam);

            console.log('profile file moved successfully');
          });

          console.log('saved profile foto'); 

          res.sendStatus(200); 
        } else {
          res.sendStatus(401);
        }
      }

      if(uploadType == 'gallery') {
        var isUserAdmin = isAdminLoggedIn(req);
        if(isUserAdmin == true) {
          var files = fs.readdirSync(photosFolder);
          var numberOfFiles = files.length;
          var newPhotoPath = path.join(form.galleryUploadDir, numberOfFiles + "_" + file.name);

          mv(file.path, newPhotoPath, function(err) {
            if (err) { throw err; }
            console.log('profile file moved successfully');
          });

          console.log('saved gallery foto'); 
        } else {
          res.sendStatus(401);
        }
      }

      if(uploadType == 'project') {
        var isUserAdmin = isAdminLoggedIn(req);
        if(isUserAdmin == true) {
          var projectId = req.query.projectId;
          var currentProjectPhotos = projectsFolder + projectId;
          if(fs.existsSync(currentProjectPhotos) == false) {
            mkdirSync(currentProjectPhotos);
          }

          var files = fs.readdirSync(currentProjectPhotos);
          var numberOfFiles = files.length;
          var newProjectPhotoPath = numberOfFiles + "_" + file.name;
          var newPhotoPath = path.join(form.projectsUploadDir + projectId, newProjectPhotoPath);

          mv(file.path, newPhotoPath, function(err) {
            if (err) { 
              throw err;
            }

            console.log('saved project foto');
          });
        } else {
          res.sendStatus(401);
        }
      }
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
      res.sendStatus(503);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);
    
    sem.leave();
  });
});


console.log('Attempting server binding creation...');

http.createServer(app).listen(sitePort, ipAddress, function() {
  console.log('Server listening on port ' + sitePort);
});

if(sitePortSecured != '') {
  if (fs.existsSync(certificatePath)) {
    var certFile = fs.readFileSync(certificatePath);
    
    const options = {
      pfx: certFile,
      passphrase: certificatePassword
    };

    console.log('Attempting server secured binding creation...');

    https.createServer(options, app).listen(sitePortSecured, ipAddress, function() {
      console.log('Server listening on secured port ' + sitePortSecured);
    });
  } 
  else {
    console.log('Certificate not found at specified path, not creating HTTPS binding');
  }
}