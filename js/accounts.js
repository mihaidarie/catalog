var accountsFileName = "database/accounts/accounts.json";

function validateCredentials(username, password){
    var loginResultOK = {
                        IsLoginOk: true,
                        UserId: "",
                        Class: "" 
                };

    var loginResultFailed =  {
          IsLoginOk: false
        };

    var userId = "";
    var userClass = "";

    var loginResult = loginResultFailed;

    $.ajax({
        dataType: "json",
        url: accountsFileName,
        data: '',
        async: false,
        success: function(allAccounts) {

        $.each(allAccounts, function(key, value) {
            // todo: decrypt stored password
            var readUsername = value.Username;
            var readPassword = value.Password;

            var isValid = readUsername == username && readPassword == password;
            
            if(isValid) {
                userId = value.Id;
                userClass = value.Class;
                loginResult = loginResultOK;
            }
        });
    }
    });

    if(loginResult == loginResultOK) {
        loginResult.UserId = userId;
        loginResult.Class = userClass;
    }

    return loginResult;
}

function validateNewCredentials(username, password) {
    
    // todo: replace with synchronous ajax call
    $.getJSON(accountsFileName, function(allAccounts) {
        $.each(allAccounts, function(key, value) {
            if(value.AccountType == "admin") {
                var adminUsername = value.Username;
                var adminPassword = value.Password;
                
                // todo: decrypt stored password
                if(username == adminUsername || password == adminPassword) {
                    return false;
                }
            }

            if(value.Username == username) {
                return false;
            }
        });
        
        return true;
    });
}

function saveAccounts(newAccountsData) {
    // todo: overwrite accounts.json
}

function modifyAccount(accountsData, newAccountData) {
    $.each(accountsData, function(key, value) {
        if(value.Id == newAccountData.Id && value.Class == newAccountData.Class) {
            updateAccountData(value, newAccountData);
        }
    });

    return profilesData;
}

function updateAccountData(currentAccountData, newAccountData) {
    currentAccountData.Username = newAccountData.Username;
    currentAccountData.Password = newAccountData.Password;
}