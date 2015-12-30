<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once 'auth.php';

$date = date_create();

$newStart = new Google_Service_Calendar_EventDateTime();

$newStart->dateTime = date_format($date,'c');

$pst = json_decode(file_get_contents("php://input"));

$id = $pst->eventId;

$results = $service->events->get($calendarId, $id);

$new = $results->summary.' [Confirmed]';

$results->setSummary($new);

$results->setStart($newStart);

$data = $id.' '.$new;
$service->events->patch($calendarId,$id,$results);
?>
