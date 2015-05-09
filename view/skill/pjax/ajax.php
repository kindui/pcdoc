<?php

$type = $_REQUEST['type'];
switch($type){
    case "a" :
        echo json_encode(array("msg"=>"黄"));
        break;
    case "b" :
        echo json_encode(array("msg"=>"俊"));
        break;
    case "c" :
        echo json_encode(array("msg"=>"华"));
        break;
}
