var accountsFileName = "database/accounts/accounts.json";

function validateCredentials(username, password){
    var loginResult = {
            IsLoginOk: false,
            UserId: "",
            Class: "" 
    };

    $.ajax({
        dataType: "json",
        type: 'POST',
        url: '/validateCredentials',
        data: {
            username: username,
            password: password
        },
        async: false,
        success: function(loginResultData) {
            loginResultData = JSON.parse(loginResultData);
            if(loginResultData.isValid === true) {
                loginResult.IsLoginOk = loginResultData.isValid;
                loginResult.UserId = loginResultData.profileId;
                loginResult.Class = loginResultData.className;
            }
        }
    });

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