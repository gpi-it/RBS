<?php
$pst = json_decode(file_get_contents("php://input"));
if ($pst->pwd=='1234'){
    echo json_encode(array('res'=> true));
}else{
    echo json_encode(array('res'=> false));
}
?>