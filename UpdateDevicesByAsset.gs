function updateChromebookbyAsset() {
  // Display a dialog box with a message and "Yes" and "No" buttons. The user can also close the
  // dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirmation: Update Devices','Do you really want to update devices with asset tags? They will be moved to OUs requested. Any information cell left empty will be overwritten with blanks', ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response == ui.Button.YES) {
    Logger.log('Ok, updating devices.');

  // Get User/Operator Info
  var userEmail = Session.getActiveUser().getEmail()
  // Get the current spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Set the sheet called UpdateCBsAsset as the sheet we're working in
  var sheet = SpreadsheetApp.setActiveSheet(ss.getSheetByName("UpdateCBsAsset"));
  // Log actions to the sheet called Log
  var logsheet = SpreadsheetApp.setActiveSheet(ss.getSheetByName("Log"));
  // Get all data from the second row to the last row with data, and the last column with data
  var lastrow = sheet.getLastRow();
  var lastcolumn = sheet.getLastColumn();
  var range = sheet.getRange(2,1,lastrow-1,lastcolumn);
  var list = range.getValues();
    for (var i=0; i<list.length; i++) {
      // Grab serial number from the first column (0), then the rest from adjoing columns and set necessary variables
      var serno = list[i][0];
      var room = list[i][2].toString();
      var asset = list[i][3].toString();
      var user = list[i][4].toString();
      var note = list[i][5].toString();      
      var ou = list[i][1].toString();
      // Since we provided serial numbers, convert each to device-id
     // var sernoquery = "id:"+serno;
      var assetTagCB = 'asset_id:' + asset;
      // Use AdminSDK API to check if the cros device exists. Else the update will fail
      var chromebooklist = AdminDirectory.Chromeosdevices.list('my_customer', {query: assetTagCB}).chromeosdevices;
        if (!chromebooklist) {
          logsheet.appendRow([asset, "not found"]);
        } else if (chromebooklist.length !== 1) {
          logsheet.appendRow([asset, chromebooklist.length+" found"]);
        } else {
          var id = chromebooklist[0].deviceId;
          // For each line, try to update the device with given data, and log the result
            try {
              AdminDirectory.Chromeosdevices.update({orgUnitPath:ou, notes:note, annotatedUser:user, annotatedAssetId:asset, annotatedLocation:room},'my_customer',id);
              logsheet.appendRow([new Date(), userEmail, serno, "Everything applied"+ " OU: "+ ou+ ", Note: "+ note+ ", User: "+ user+ ", Asset: "+ asset+ ", Location: "+ room]);

              // If the update fails for some reason, log the error
            } catch (err) {
              logsheet.appendRow([asset, err]);
            }
        }
    }
  } else {
    Logger.log('The user clicked "No" or the close button in the dialog\'s title bar.');
  }
}

