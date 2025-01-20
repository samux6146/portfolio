document.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        var command = document.getElementById("command").innerHTML;
        var path = document.getElementById("path").innerHTML;
        document.getElementById("command").innerHTML = "";
        document.getElementById("output").innerHTML += '<div class="row"> <p style="color: #49AEF8;">' + path + '</p> <p style="color: #80D340;"> ></p> <p class="command">' + command + '</p> </div>';
        parseCommand(command);
        window.scrollTo(0, document.body.scrollHeight - 100);
    } else if (event.key === "Backspace") {
        document.getElementById("command").innerHTML = document.getElementById("command").innerHTML.slice(0, -1);
    } else if (event.key.length > 1) {
        return;
    } else {
        document.getElementById("command").innerHTML += event.key;
    }
});


function parseCommand(command) {
    var command = command.toLowerCase();
    command = command.split(" ");
    if (command[0] === "") {
        return;
    }
    if (command[0] === "help" && command.length === 1) {
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">help: displays this message</p> </div>';
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">clear: clears the console</p> </div>';
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">ls: lists the contents of a directory</p> </div>';
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">cd: changes the current directory</p> </div>';
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">cat: displays the contents of a file</p> </div>';
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">exit: closes the console (chrome based only)</p> </div>';
    }
    else if (command[0] === "clear" && command.length === 1) {
        document.getElementById("output").innerHTML = "";
    } else if (command[0] === "ls") {
        if (command.length === 1) {
            var path = document.getElementById("path").innerHTML;   
        } else {
            var path = document.getElementById("path").innerHTML + command[1];
        }
        document.getElementById("output").innerHTML += '<div class="row">' + ls(path) + '</div>';
    } else if (command[0] === "cd") {
        if (command.length === 1) {
            document.getElementById("output").innerHTML += '<div class="row"> <p class="command">no argument given </p> </div>';
        } else if (command[1] === "..") {
            var path = document.getElementById("path").innerHTML;
            if (path === "~/") {
                return;
            }
            path = path.split("/");
            path.pop();
            path.pop();
            path = path.join("/");
            cd(path);

        } else {
            var path = document.getElementById("path").innerHTML + command[1];
            cd(path)
        } 
    } else if (command[0] === "cat") {
        if (command.length === 1) {
            document.getElementById("output").innerHTML += '<div class="row"> <p class="command">no argument given </p> </div>';
        } else {
            var path = document.getElementById("path").innerHTML + command[1];
            var renderedpath = "";
            path = path.split("/");
            path.shift();
            for (key in path) {
                if (getJsonValue(disk, renderedpath + "." + path[key] + ".type") === "file") {
                    renderedpath += "." + path[key];
                } else {
                    renderedpath += "." + path[key] + ".content";
                }
            }
            var file = getJsonValue(disk, renderedpath);
            if (file === undefined) {
                document.getElementById("output").innerHTML += '<div class="row"> <p class="command">file not found: ' + command[1] + '</p> </div>';
            } else {
                if (file.type === "file") {
                    document.getElementById("output").innerHTML += file.content;
                } else {
                    document.getElementById("output").innerHTML += '<div class="row"> <p class="command">' + command[1] + ' is a directory</p> </div>';
                }
            }
        }
    } else if (command[0] === "rm" & command[1] === "-rf" && command.length === 3) {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", '_blank').focus();
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command" style="color: red;">Nice try, but you got rickrolled ;)</p> </div>';
    } else if (command[0] === "exit") {
        window.close('','_parent','');
    } else {
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">command not found: ' + command[0] + '</p> </div>';
    }
}

function cd(path){
    if (getDir(path) !== undefined) {
        if (path.charAt(path.length - 1) === "/") {
            document.getElementById("path").innerHTML = path;
        } else {
            document.getElementById("path").innerHTML = path + "/";
        }
    } else {
        document.getElementById("output").innerHTML += '<div class="row"> <p class="command">path not found: ' + path[0] + '</p> </div>';
    }
}

function ls(path){
    var out = "";
    if (getDir(path) === undefined) {
        return '<div class="row"> directory not found </div>';
    }
    getDir(path).forEach(e => {
        var name = e[0];
        var type = e[1];
        out += '<div class="row ' + type + '">' + name + '⠀⠀⠀⠀⠀</div>';
    });
    return out;
}

function getDir(path){
    var path = path.split("/");
    var diskinistance = disk
    var out = [];
    path.shift();
    if(path[path.length - 1] === "" & path.length !== 1) {
        path.splice(-1);
    }
    if (path[0] === "") {
        for (key in diskinistance) {
            out.push([diskinistance[key].name, diskinistance[key].type]);
        }
    } else {
        var renderedpath = ""
        for (key in path) {
            renderedpath += "." + path[key] + ".content";
        }
        if (getJsonValue(diskinistance, renderedpath) === undefined) {
            return undefined;
        }
        for (key in getJsonValue(diskinistance, renderedpath)) {
            out.push([getJsonValue(diskinistance, renderedpath)[key].name, getJsonValue(diskinistance, renderedpath)[key].type]);
        }
    }
    return out;
}

function getJsonValue(obj, path) {
    const keys = path.split(".");
    keys.shift();
    let result = obj;
    for (const key of keys) {
        if (result[key] !== undefined) {
            result = result[key];
        } else {
            return undefined;
        }
    }
    return result;
}