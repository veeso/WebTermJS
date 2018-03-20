<?php

class Webterm {

  private $path;
  private $commandArg;
  private $response;
  private $blacklist = array();

  public function __construct($path, $commandArg) {
    $this->path = $path;
    $this->commandArg = $commandArg;
  }

  //Blacklist methods
  public function setBlacklist($blacklist) {
    $this->blacklist = $blacklist;
  }

  private function isBlacklisted($command) {
    if(count($this->blacklist) == 0) {
      return false;
    }
    if(in_array($command, $this->blacklist)) {
      return true;
    }
    else {
      return false;
    }
  }

  //Build response array
  private function buildResponse($path, $response) {
    return array("path" => $path, "response" => $response);
  }

  public function executeCommand() {
    //Command is the first element
    $command = $this->commandArg[0];
    //argv is arguments starting from the second element
    $argv = array_slice($this->commandArg, 1);
    //Check through blacklist
    if($this->isBlacklisted($command)) {
      return $this->err_CommandNotFound();
    }
    //Else is valid
    $this->response = null;
    switch($command) {

      case "cd":
      $this->response = $this->ex_cd($argv);
      break;

      case "cat":
      $this->response = $this->ex_cat($argv);
      break;

      case "rm":
      $this->response = $this->ex_rm($argv);
      break;

      case "touch":
      $this->response = $this->ex_touch($argv);
      break;

      case "ln":
      $this->response = $this->ex_ln($command, $argv);
      break;

      case "echo":
      $this->response = $this->ex_echo($command, $argv);
      break;

      //Edited file
      case "###SAVEFILE~":
      $this->response = $this->ex_SAVEFILE($argv);
      break;

      //Create file for editor
      case "###CREATEFILE~":
      $this->response = $this->ex_create($argv);
      break;

      default:
      $this->response = $this->ex_GenericPurposeCommand($command, $argv);
      break;
    }

    return $this->response;

  }

  //Command methods

  private function resolvePath($oldPath, $newPath) {

    if(substr($oldPath, -1) != '/') {
      $oldPath = $oldPath . "/";
    }

    if($newPath == ".") {
      return $oldPath;
    }

    //Resolve root/..
    if($newPath == "/..") {
      return "/";
    }
    $bak = $newPath;
    //Does not start with root
    if(substr($newPath, 0, 1) != '/') {
      $newPath = $oldPath . $newPath;
    }
    //Check if user required previous path
    if($bak == "..") {
      $tmpPath = substr($oldPath, 0, strrpos($oldPath, "/"));
      $newPath = substr($tmpPath, 0, strrpos($tmpPath, "/") + 1);
    }

    return $newPath;
  }

  private function ex_cd($argv) {
    $newPath = $this->resolvePath($this->path, $argv[0]);
    if(is_dir($newPath)) {
      if(substr($newPath, -1) != "/") {
        $newPath = $newPath .  "/";
      }
      return $this->buildResponse($newPath, null);
    }
    else {
      return $this->err_noFile();
    }
  }

  private function ex_touch($argv) {
    $newPath = $this->resolvePath($this->path, $argv[0]);
    if(is_dir($newPath)) {
      return $this->err_isDir();
    }
    else {
      if(touch($newPath)) {
        return $this->buildResponse($this->path, null);
      }
      else {
        return $this->err_pex();
      }
    }
  }

  private function ex_cat($argv) {
    $newPath = $this->resolvePath($this->path, $argv[0]);
    if(!is_file($newPath)) {
      return $this->err_noFile();
    }
    $hnd = fopen($newPath, "r");
    $content = fread($hnd, filesize($newPath));
    fclose($hnd);
    return $this->buildResponse($this->path, $content);
  }

  //Create file for editor or cat it if it exists
  private function ex_create($argv) {
    $newPath = $this->resolvePath($this->path, $argv[0]);
    if(!is_file($newPath)) {
      if(!touch($newPath)) {
        return $this->err_pex();
      }
    }
    $hnd = fopen($newPath, "r");
    $content = fread($hnd, filesize($newPath));
    fclose($hnd);
    return $this->buildResponse($this->path, $content);
  }

  private function ex_ln($command, $argv) {
    //Prepare arguments
    chdir($this->path);
    $command = $command . " ";
    foreach($argv as $arg) {
      $command = $command . " " . $arg;
    }
    $status = shell_exec($command);
    return $this->buildResponse($this->path, $status);
  }

  private function ex_echo($command, $argv) {
    //Prepare arguments
    chdir($this->path);
    $command = $command . " ";
    foreach($argv as $arg) {
      $command = $command . " " . $arg;
    }
    $status = shell_exec($command);
    return $this->buildResponse($this->path, $status);
  }

  private function ex_rm($argv) {
    $newPath = $this->resolvePath($this->path, $argv[0]);
    if(is_file($newPath) || is_dir($newPath)) {
      $this->recurseDel($newPath);
      if(file_exists($newPath)) {
        return $this->err_pex();
      }
      else {
        return $this->buildResponse($this->path, null);
      }
    }
    else {
      return $this->err_noFile();
    }
  }

  private function recurseDel($dir) {
    if (is_dir($dir)) {
      $objects = scandir($dir);
      foreach ($objects as $object) {
        if ($object != "." && $object != "..") {
          if (is_dir($dir."/".$object)) {
            rrmdir($dir."/".$object);
          }
          else {
            unlink($dir."/".$object);
          }
        }
      }
      rmdir($dir);
    }
    else {
      unlink($dir);
    }
  }

  private function ex_SAVEFILE($argv) {
    $hnd = fopen($argv[0], "w");
    fwrite($hnd, $argv[1]);
    fclose($hnd);
    return $this->buildResponse($this->path, null);
  }

  //Command not defined specifically
  private function ex_GenericPurposeCommand($command, $argv) {
    //Prepare arguments
    chdir($this->path);
    $command = $command . " ";
    foreach($argv as $arg) {
      $command = $command . " " . $arg;
    }
    $status = shell_exec($command);
    if($status == null) {
      return $this->err_CommandNotFound();
    }
    return $this->buildResponse($this->path, $status);
  }

  //Errors
  private function err_CommandNotFound() {
    return $this->buildResponse($this->path, "Error: command not found!\n");
  }

  private function err_noFile() {
    return $this->buildResponse($this->path, "No such file or directory!\n");
  }

  private function err_isDir() {
    return $this->buildResponse($this->path, "Is a directory!\n");
  }

  private function err_pex() {
    return $this->buildResponse($this->path, "Not enough permissions!\n");
  }

}

?>
