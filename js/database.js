function saveProfiles(filePath, newProfilesData) {
    // todo: overwrite classes.json
}

function modifyProfile(profilesData, newProfile) {
    $.each(profilesData, function(key, value) {
        if(value.Id == newProfile.Id) {
            updateProfileData(value, newProfile);
            // BREAK
        }
    });
    
    return profilesData;
}

function updateProfileData(currentProfileData, newProfileData) {
    currentProfileData.FirstName = newProfileData.FirstName;
    currentProfileData.LastName = newProfileData.LastName;
    currentProfileData.SmallPhotoPath = newProfileData.SmallPhotoPath;
    currentProfileData.Phone = newProfileData.Phone;
    currentProfileData.Address = newProfileData.Address;
    currentProfileData.Country = newProfileData.Country;
    currentProfileData.LinkedIn = newProfileData.LinkedIn;
    currentProfileData.Facebook = newProfileData.Facebook;
    currentProfileData.Occupation = newProfileData.Occupation;
    currentProfileData.Email = newProfileData.Email;
    currentProfileData.Description = newProfileData.Description;
    currentProfileData.Other = newProfileData.Other;
}