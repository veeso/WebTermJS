# WebTermJS

~ Developed by Christian Visintin

#### Version 0.8

## Introduction

**WebTermJS** is a simple linux terminal for web. It supports all the commands which can be executed by shell_exec (PHP), in addition to other commands which are executed directly by the PHP interpreter and other (such as clear), which are executed by the javascript client.
In order to work, WebTermJS requires PHP (at least PHP 5.3.0) and jQuery (at least 1.6).

## Implementation

In order to implement WebTermJS in your page, you have to get the source from source-min.
Then you have to link webterm.js and webterm.css to your HTML page and set a variable webtermCommunicator to the web path to **webtermCom.php** (which **has to be the same of webtermLib.php**), which is set by default to  

```js
var webtermCommunicator = "/php/webtermCom.php";
```
Once you've done this, to add the terminal in your page embed this in your page (or make a script which embeds it for you)
```html
<!-- WebTermJS here - Embed this into your page -->
<div id="webtermJS">
  <script>
  new WebTerm("foo", "hostname", "/home/foo/");
  </script>
</div>
```
The arguments which have to be passed to the WebTerm constructor are "user", "hostname", "homepath".
The ID must be webtermJS, while the class is optional and is a theme (see Themes section).
Once you've done this, it should work.

If you need to add passwords, permissions or other stuff, I suggest you to edit **webtermCom.php** to fit your purpose.


## Commands

In WebTermJS there are 4 kinds of commands divided in two categories:  

* **Client-Side Commands**
  * ImmediatelySolved Commands - Are the commands which are immediately executed by JavaScript, and are the following commands:
    * clear - Clear console
    * history - show history
    * ! [history index] - insert into the command line the command with [history index] as index. Just try history to understand how it works.
    * mcedit/vi/vim/nano/edit - It's not really an ImmediatelySolved command, indeed once issued it makes a request to the server using "cat" as command. It's used to open the text editor; see Text Editor section for details.

* **Server-Side Commands**
  * Well-Defined Commands - They are the commands which are executed by the PHP interpreter without using shell_exec. They are made up of the following commands:
    * cd [path]
    * cat [path]
    * rm [path] - Attention: It doesn't require any argument except the path. **It is always recursive, so if you set path to a directory, it will delete the entire directory and its content**.
    * touch [path]
    * ln [target] [link name] - Create symbolic link,
  * General Purpose Commands - Are the commands which are executed by shell_exec (that is all the commands which are not specified in any other category).
  * User-Defined Commands - (**Upcoming features**) - Are aliases defined by the user.

### Blacklisting

WebTermJS allows you to blacklist a command. If you use the webtermLib method setBlacklist($blacklist), where $blacklist is a simple array of commands
(e.g. ["echo", "ssh", "ping", "ifconfig"]), all the commands defined in the array won't be allowed to be used and will return to the user "Error: command not found!"

## Text Editor

Typing nano/edit/vi/vim/mcedit [filename] in the command line, the console will display the content of the defined file and will be editable.
If the file doesn't exist it will be created if possible.
To edit the file, just write in the console what you want to write.
When the text editor is enabled, only the following commands are enabled:
* :q - Quit without saving the edited file
* :q! - See :q
* :w - Write changes to file.
* :wq - Write changes to file and close the editor.

## Themes

There are a few themes for the terminal which can be set as class of the webterm div
```html
  <div id="webtermJS" class="webtermJSxubuntu"/>
```

Supported themes are:
* webtermJSxubuntu - background-color: rgb(20,25,40)
* webtermJSubuntu - background-color: rgb(48,10,36)

By default the terminal background colour is black and the foreground colour is white.

---

### Contributions

Contributions are welcome, feel free to fork the project and make pull requests.
The original source is located in source directory.

---

### License

WebTermJS is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
WebTermJS is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with WebTermJS.  
If not, see <http://www.gnu.org/licenses/>.
