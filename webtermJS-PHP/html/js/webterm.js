/*
*
*   -- WebTermJS --
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

//override if changes
var webtermApp = "/php/webtermCom.php";
//var webtermApp = "/webterm/";

class WebTerm {
  constructor(user, domain, home) {
    //Bash prefix
    this.prefix = user + "@" + domain;
    //Initialize paths
    this.tryPath = home;
    this.currentPath = "~";
    this.previousPath = home;
    this.home = home;
    //create history array
    this.history = [];
    //History pointer
    this.historyPtr = 0;
    this.editorEnabled = false;
    this.editorFile = null;
    var wbtrm = this;
    //Create textarea
    $("#webtermJS").append("<textarea id='webtermContent' disabled></textarea>");
    //Create command line
    $("#webtermJS").append("<form>" + printPrefix(this) + "<input autocomplete='off' id='webtermJScommand' type='text'/></form>");
    //Event listener for submit
    $("#webtermJScommand").parent().submit(function (ev) {
      //Prevent default obviously
      ev.preventDefault();
      //Then issue it
      issueCommand(wbtrm, $("#webtermJScommand").val());
    });
    //Event listener for history
    $("#webtermJScommand").keydown(function (ev) {
      exploreHistory(wbtrm, ev);
    });
  }
}

// Shell UTILS -> Functions which resolve UI and shell logic

function printPrefix(webterm) {
  return "<span class='webtermJSprefix'>"+webterm.prefix+"</span>:<span class='webtermJSpath'>"+resolvePath(webterm)+"</span>$ ";
}

function printPrefixOut(webterm) {
  return webterm.prefix+":"+resolvePath(webterm)+"$ ";
}

function updatePrefixPath(webterm) {
  $('.webtermJSpath').text(resolvePath(webterm));
}

function exploreHistory(webterm, ev) {
  var command;
  if(ev.which == 38) {
    ev.preventDefault();
    command = webterm.history[webterm.historyPtr];
    $("#webtermJScommand").val(command);
    if(webterm.historyPtr > 0) {
      webterm.historyPtr--;
    }
  }
  else if(ev.which == 40) {
    ev.preventDefault();
    command = webterm.history[webterm.historyPtr];
    $("#webtermJScommand").val(command);
    if(webterm.historyPtr + 1 < webterm.history.length) {
      webterm.historyPtr++;
    }
    else if(webterm.historyPtr + 1 == webterm.history.length) {
      $("#webtermJScommand").val("");
    }
  }
}

//Resolve path - eg. relative path to absolute, home to ~
function resolvePath(webterm) {
  var path = webterm.tryPath;

  if(path == ".") {
    return webterm.currentPath;
  }
  //Resolve home
  if(webterm.currentPath === webterm.home || path === webterm.home) {
    return "~";
  }

  //inverse operation
  if(webterm.currentPath === "~") {
    return webterm.home;
  }
  //Resolve root/..
  if(path === "/..") {
    return "/";
  }
  //Resolve others
  var bakPath = path;
  //Does not start with root
  if(bakPath.charAt(0) != '/') {
    path = webterm.currentPath + webterm.tryPath;
  }
  //Check if user required previous path
  if(bakPath === "..") {
    var prevPath = webterm.tryPath.substr(0,webterm.tryPath.lastIndexOf("/"));
    path = prevPath.substr(0,prevPath.lastIndexOf("/") + 1);
  }
  //Check if user required last path
  if(bakPath === "-") {
    path = webterm.previousPath;
  }
  //Check if required path starts from home
  if(bakPath.charAt(0) == '~') {
    path = webterm.home + webterm.tryPath;
  }

  return path;
}

/* COMMANDS FUNCTIONS */

//Issue command function -> handle arguments and command
function issueCommand(webterm, command) {

  //Check if editor is disabled
  if(!webterm.editorEnabled) {
    //Store into argv the argument -> argv[0] is always the command
    //Write to console the command
    $('#webtermContent').val($('#webtermContent').val() + printPrefixOut(webterm) + command + "\n");
    $("#webtermContent").animate({ scrollTop: $('#webtermContent').prop("scrollHeight")}, 300);
    if(command.length === 0) {
      return;
    }
    var argv = command.split(' ');
    webterm.history.push(command);
    webterm.historyPtr = webterm.history.length - 1;

    //Don't execute command if null

    //Resolve Command > the command is already solved by an internal function and does not need to be sent to back-end
    if(commandCanBeSolvedImmediately(webterm, argv)) {
      if(argv[0] != "!")
      $("#webtermJScommand").val("");
      $("#webtermContent").animate({ scrollTop: $('#webtermContent').prop("scrollHeight")}, 300);
      return;
    }

    //Send command to backend
    //Response is always: path, response
    webterm.tryPath = webterm.currentPath;
    $.post(webtermApp, {path: resolvePath(webterm), command: argv}, function(data, status) {
      data = JSON.parse(data);
      if(data.response != null) {
        $('#webtermContent').val($('#webtermContent').val() + data.response);
      }
      webterm.previousPath = webterm.currentPath;
      webterm.tryPath = data.path;
      webterm.currentPath = data.path;
      webterm.currentPath = resolvePath(webterm);
      updatePrefixPath(webterm);
      $("#webtermContent").animate({ scrollTop: $('#webtermContent').prop("scrollHeight")}, 300);
    });
  }
  //Else editor commands
  else {
    if(command.length === 0) {
      return;
    }
    var argved = command.split(' ');
    resolveEditorCommand(webterm, argved);
  }
  //Eventually Clean command line
  $("#webtermJScommand").val("");
}

function commandCanBeSolvedImmediately(webterm, argv) {
  var solved = false;
  switch(argv[0]) {
    case "clear":
    $('#webtermContent').val("");
    solved = true;
    break;

    case "history":
    var hist = "";
    for(var i = 0; i < webterm.history.length; i++) {
      hist = hist + "\n" + i + "\t" + webterm.history[i];
    }
    $('#webtermContent').append(hist + "\n");
    solved = true;
    break;

    case "!":
    if(argv[1] > webterm.history.length - 1) {
      argv[1] = webterm.history.length - 1;
    }
    $("#webtermJScommand").val(webterm.history[argv[1]]);
    solved = true;
    break;

    //TXTEditor
    case "mcedit":
    openEditor(webterm, argv);
    solved = true;
    break;

    case "vi":
    openEditor(webterm, argv);
    solved = true;
    break;

    case "vim":
    openEditor(webterm, argv);
    solved = true;
    break;

    case "edit":
    openEditor(webterm, argv);
    solved = true;
    break;

    case "nano":
    openEditor(webterm, argv);
    solved = true;
    break;

  }
  return solved;
}

function openEditor(webterm, argv) {
  webterm.editorEnabled = true;
  webterm.editorFile = argv[1];
  /*Make a cat
  /\_/\
  ( o.o )
  > ^ <
  */
  argv[0] = "###CREATEFILE~";
  webterm.tryPath = webterm.currentPath;
  $.post(webtermApp, {path: resolvePath(webterm), command: argv}, function(data, status) {
    data = JSON.parse(data);
    $('#webtermContent').val(data.response);
    $('#webtermContent').prop("disabled", false);
  });
}

//Resolve text editor commands
function resolveEditorCommand(webterm, argv) {
  switch(argv[0]) {
    case ":q!":
    closeEditor(webterm);
    break;

    case ":q":
    closeEditor(webterm);
    break;

    case ":w":
    saveFile(webterm, argv);
    break;

    case ":wq":
    saveAndCloseFile(webterm, argv);
    break;

    default:
    $("#webtermJScommand").val("Unknown command");
    break;
  }
}

function closeEditor(webterm) {
  $('#webtermContent').val("");
  webterm.editorEnabled = false;
  //$('#webtermContent').prop("disabled", true);
}

function saveFile(webterm, argv) {
  argv[0] = "###SAVEFILE~";
  argv[1] = resolvePath(webterm) + webterm.editorFile;
  argv[2] = $("#webtermContent").val();
  $.post(webtermApp, {path: resolvePath(webterm), command: argv}, function(data, status) {
    $("#webtermJScommand").val("File saved!");
  });
}

function saveAndCloseFile(webterm, argv) {
  argv[0] = "###SAVEFILE~";
  argv[1] = resolvePath(webterm) + webterm.editorFile;
  argv[2] = $("#webtermContent").val();
  $.post(webtermApp, {path: resolvePath(webterm), command: argv}, function(data, status) {
    closeEditor(webterm, argv);
  });
}
