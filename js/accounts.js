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