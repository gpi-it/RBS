<?php
require_once 'auth.php';

$date = date_create();

$end = new Google_Service_Calendar_EventDateTime();

$end->dateTime = date_format($date,'c');

$pst = json_decode(file_get_contents("php://input"));

$id = $pst->eventId;

$results = $service->events->get($calendarId, $id);

$results->setEnd($end);

$service->events->patch($calendarId,$id,$results);

var_dump($end);
?>