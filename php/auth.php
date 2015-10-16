<?php
 require_once 'Google/autoload.php';
   session_start();
date_default_timezone_set('Europe/Amsterdam');
/************************************************	
 The following 3 values an be found in the setting	
 for the application you created on Google 	 	
 Developers console.	 	 Developers console.
 The Key file should be placed in a location	 
 that is not accessible from the web. outside of 
 web root.	 
 	 	 
 In order to access your GA account you must	
 Add the Email address as a user at the 	
 ACCOUNT Level in the GA admin. 	 	
 ************************************************/
 	$devicesString='';
 	if(file_exists('../js/data.json'))
 	{
 		$devicesString = file_get_contents('../js/data.json');
 	}
 	else
 	{
 		$devicesString = file_get_contents('js/data.json');
 	}
	$extr = json_decode($devicesString);
	$calendarId = '';
	if(isset($_COOKIE['rmDevice']))
	{
		foreach($extr as $object)
		{
			if($object->deviceid==$_COOKIE['rmDevice'])
			$calendarId=$object->calendar;
		}
	}
	else{
		$calendarId='greenpeace.org_2d3932343437383231@resource.calendar.google.com';
	}
    $client_id = '708497098884-f32pd1cegl8pge88h6mjp9kudrlbk3pm.apps.googleusercontent.com';
	$Email_address = '708497098884-f32pd1cegl8pge88h6mjp9kudrlbk3pm@developer.gserviceaccount.com';	
	$key_file_location = '/var/www/html/php/key.p12';
	
	$client = new Google_Client();	 	
	$client->setApplicationName("Rooms booking system");
	$key = @file_get_contents($key_file_location);

	if (isset($_SESSION['service_token'])) {
  $client->setAccessToken($_SESSION['service_token']);
}

// separate additional scopes with a comma	 
$scopes ="https://www.googleapis.com/auth/calendar"; 	
$cred = new Google_Auth_AssertionCredentials(	 
	$Email_address,	 	 
	array($scopes),	 	
	$key	 	 
	);	 	
$client->setAssertionCredentials($cred);
if($client->getAuth()->isAccessTokenExpired()) {	 	
	$client->getAuth()->refreshTokenWithAssertion($cred);	 	
}
$_SESSION['service_token'] = $client->getAccessToken();
$service = new Google_Service_Calendar($client); 
?>