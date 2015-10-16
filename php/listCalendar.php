<?php
require_once 'auth.php';

$calendarList = $service->calendarList->listCalendarList();

$pippo = array();

while(true) {
  foreach ($calendarList->getItems() as $calendarListEntry) {
    $temp=array("summary"=>$calendarListEntry->getSummary(),"id"=>$calendarListEntry->getId());
    array_push($pippo,$temp);
  }
  $pageToken = $calendarList->getNextPageToken();
  if ($pageToken) {
    $optParams = array('pageToken' => $pageToken);
    $calendarList = $service->calendarList->listCalendarList($optParams);
  } else {
    break;
  }
}

echo json_encode($pippo);
?>