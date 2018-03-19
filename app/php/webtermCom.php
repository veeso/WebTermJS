<?php

/*
*
*   -- webtermCom --
*
* 	Copyright (C) 2018 Christian Visintin - christian.visintin1997@gmail.com
*
* 	This file is part of WebTermJS
*
*   WebTermJS is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   WebTermJS is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with WebTermJS.  If not, see <http://www.gnu.org/licenses/>.
*
*/

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
