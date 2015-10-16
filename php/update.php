<?php


$jsonString = file_get_contents('../js/data.json');
$data = json_decode($jsonString);
foreach($data as $object)
{
    if($object->deviceid==$_POST['device'])
    {
        switch($_POST['attr'])
        {
            case 'calendar':
                $object->calendar=$_POST['value'];
                break;
            case 'auth':
                $object->auth=$_POST['value'];
                break;
            case 'mainDevice':
                $object->mainDevice=$_POST['value'];
                break;
        }
    }
}

$jsonData = json_encode($data);
file_put_contents('../js/data.json', $jsonData);
?>