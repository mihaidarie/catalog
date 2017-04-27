var accountsFileName = "database/accounts/accounts.json";

function validateCredentials(username, password) {

    $.getJSON(accountsFileName, function( allAccounts ) {
        $.each(allAccounts, function(key, value) {
            // todo: decrypt stored password

            if(value.Username == username && value.Password == password) {
               return true;
            }
        });
        
        return false;
    });
}

function validateNewCredentials(username, password) {
    
    $.getJSON(accountsFileName, function( allAccounts ) {
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
    }
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