<?php
require_once 'auth.php';

require_once 'devices.php';

function in_array_r($needle, $haystack, $strict = false) {
    foreach ($haystack as $item) {
        if (($strict ? $item === $needle : $item == $needle) || (is_array($item) && in_array_r($needle, $item, $strict))) {
            return true;
        }
    }

    return false;
}

$pst = json_decode(file_get_contents("php://input"));
$jsonString = file_get_contents('../js/data.json');
if($jsonString === false) {
    echo "Error";
} else {
    echo "All good, $jsonString";
    var_dump(is_writable('../js/data.json'));
    var_dump(file_exists('../js/data.json'));
}
$data = json_decode($jsonString);
$cookie_name = "rmDevice";
setcookie($cookie_name, $pst->deviceid, 2147483647, "/");
$new= array("deviceid"=>$pst->deviceid,"device"=>$currDevice,"calendar"=>$pst->calendar,"auth"=>true , "mainDevice"=>$pst->maindevice);

if(!in_array_r($pst->deviceid,$data)){
array_push($data,$new);
$jsonData = json_encode($data);
$var = file_put_contents('../js/data.json', $jsonData);
if($var === false) {
    echo "Error";
} else {
    echo "All good, $var";
}
}
?>
