<?php

if(stripos($_SERVER['HTTP_USER_AGENT'],"iPod")){
    $currDevice="iPod";
}elseif(stripos($_SERVER['HTTP_USER_AGENT'],"iPhone")){
    $currDevice="iPhone";
}
elseif(stripos($_SERVER['HTTP_USER_AGENT'],"iPad")){
    $currDevice="iPad";
}
elseif(stripos($_SERVER['HTTP_USER_AGENT'],"webOS")){

    if(stripos($_SERVER['HTTP_USER_AGENT'],"Pre") || stripos($_SERVER['HTTP_USER_AGENT'],"Pixi")){
        $currDevice="webOS Phone";
    }
    if(stripos($_SERVER['HTTP_USER_AGENT'],"TouchPad")){
        $currDevice="webOS Tablet";
    }
}
elseif(stripos($_SERVER['HTTP_USER_AGENT'],"Android")){

    if(stripos($_SERVER['HTTP_USER_AGENT'],"mobile")){
        $currDevice="Android Phone";
    }else{
        $currDevice="Android Tablet";
    }
}
elseif(stripos($_SERVER['HTTP_USER_AGENT'],"Windows")){

    if(stripos($_SERVER['HTTP_USER_AGENT'],"Touch")){
        $currDevice="Windows tablet";
    }
    if(stripos($_SERVER['HTTP_USER_AGENT'],"Windows Phone")){
        $currDevice="Windows phone";
    }
}
else{
    $currDevice="PC";
}
?>