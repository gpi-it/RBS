<?php
require_once 'auth.php';

$date = date_create();

$pst = json_decode(file_get_contents("php://input"));

$id = $pst->eventId;

$results = $service->events->get($calendarId, $id);

$new = $results->summary.' [Confirmed]';

$results->setSummary($new);

$data = $id.' '.$new;
$service->events->patch($calendarId,$id,$results);
echo $data;
?>