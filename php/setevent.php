<?php
require_once 'auth.php';

$ev = new Google_Service_Calendar_Event(json_decode(file_get_contents("php://input"), true));

$service->events->insert($calendarId,$ev);
?>