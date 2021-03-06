<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');
require_once 'auth.php';

$date=date_create();
$dateMax=date_create();
date_time_set($dateMax, 23, 00);

$optParams = array(
  'orderBy' => 'startTime',
  'singleEvents' => TRUE,
  'timeMin' => date_format($date,'c'),
  'timeMax' => date_format($dateMax, 'c')
);
$results = $service->events->listEvents($calendarId, $optParams);

$pippo = array();
$i= 0;
  foreach ($results->getItems() as $event) {
    $start = $event->start->dateTime;
    $end = $event->end->dateTime;
    if (empty($start) && empty($end)) {
      $start = $event->start->date;
      $end = $event->end->date;
      $allday = true;
    }
    else{
        $allday = false;
    }
    if ((date('c')>$start)&&(date('c')<$end))
    {
      $current=true;
    }
    else {
      $current=false;
    }
    $temp = array("id" => $event->id, "summary" => $event->summary, "creator" => $event->creator->email, "allday" => $allday, "start" => $start, "end" => $end, "current" => $current);
    array_push($pippo,$temp);
    $i++;
}
echo json_encode($pippo);
?>
