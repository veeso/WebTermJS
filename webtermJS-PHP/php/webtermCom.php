<?php

define('__ROOT__', dirname(dirname(__FILE__)));
//Change path if required
require_once('webtermLib.php');

if(isset($_POST['path']) && isset($_POST['command'])) {
  $webterm = new Webterm($_POST['path'], $_POST['command']);
  exit(json_encode($webterm->executeCommand()));

}
else {
  http_response_code(501);
}

?>
