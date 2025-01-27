document.addEventListener('paste', function(event) {
    document.getElementById("command").innerHTML += event.clipboardData.getData('text');
})


let history = [];
let historypos = 0;

document.addEventListener('keydown', function(event) {
    event.preventDefault();
    if (event.key === "Enter") {
        var command = document.getElementById("command").innerHTML;
        var path = document.getElementById("path").innerHTML;
        document.getElementById("command").innerHTML = "";
        document.getElementById("autocomplete").innerHTML = "";
        document.getElementById("output").innerHTML += '<div class="row"> <p class="path">' + path + '</p> <p style="color: #80D340;">&gt;</p> <p class="command">' + command + '</p> </div>';
        if (command !== "") {
            history.push(command);
            historypos = history.length;   
        }
        parseCommand(command);
        window.scrollTo(0, document.body.scrollHeight - 100);
    } else if (event.key === "Backspace") {
        document.getElementById("command").innerHTML = document.getElementById("command").innerHTML.slice(0, -1);
    } else if (event.key === "ArrowUp") {
        if (history.length > 0 & historypos > 0) {
            historypos -= 1;
            document.getElementById("command").innerHTML = history[historypos];
        }
    } else if (event.key === "ArrowDown") {
        if (history.length > 0 & historypos < history.length) {
            historypos += 1;
            document.getElementById("command").innerHTML = history[historypos];
        }
        if (historypos === history.length) {
            document.getElementById("command").innerHTML = "";
        }
    } else if (event.ctrlKey | event.metaKey) {
        return;
    } else if (event.key === "Tab") {
        var commands = ["help", "clear", "ls", "cd", "cat", "exit"];
        var command = document.getElementById("command").innerHTML;
        var path = document.getElementById("path").innerHTML;
        command = command.toLowerCase();
        command = command.split(" ");
        if (command.length === 1) {
            var res = [];
            commands.forEach(com => {
                if (com.startsWith(command[0])) {
                    res.push(com);
                }
            })
            if (res.length === 1) {
                document.getElementById("autocomplete").innerHTML = "";
                document.getElementById("command").innerHTML = res[0];
            } else {
                var out = "";
                res.forEach(com => {
                    out += '<div class="row">' + com + '⠀⠀</div>';
                })
                document.getElementById("autocomplete").innerHTML = '<div class="row">' + out + '</div>';
            }
        } else if (["ls", "cd", "cat"].includes(command[0])){
            var attr = command[1].split("/");
            //var opath = getDir(path)
            attr.forEach(el => {
                getDir(path).forEach( d => {
                if (el === d[0]) {
                    path += el + "/";
                }
                })
            }) 
            var gdir = getDir(path);
            var res = [];
            var resfil = [];
            var folders = [];
            var files = [];
            gdir.forEach(dir => {
                if (dir[1] === "folder") {
                    folders.push(dir[0]);
                } else if (dir[1] === "file") {
                    files.push(dir[0]);
                }
            })
            var lenattr = attr.length - 1
            folders.forEach(fold => {
                if (fold.startsWith(attr[lenattr])) {
                    res.push(fold);
                }
            })
            if (command[0] === "cat"){
                files.forEach(fil => {
                    if (fil.startsWith(attr[lenattr])) {
                        resfil.push(fil);
                    }
                })   
            }
            if (res.length === 1 & resfil.length === 0) {
                document.getElementById("autocomplete").innerHTML = "";
                var localpath = document.getElementById("path").innerHTML
                localpath = localpath.substring(2)
                var p = path.substring(2);
                p = p.replace(localpath, "")
                document.getElementById("command").innerHTML = command[0] + " " + p + res[0] + "/";
            } else if (res.length === 0 & resfil.length === 1){
                document.getElementById("autocomplete").innerHTML = "";
                var localpath = document.getElementById("path").innerHTML
                localpath = localpath.substring(2)
                var p = path.substring(2);
                p = p.replace(localpath, "")
                document.getElementById("command").innerHTML = command[0] + " " + p + resfil[0];
            } else {
                var out = "";
                res.forEach(fold => {
                    out += '<div class="row folder">' + fold + '⠀⠀</div>';
                })
                if (command[0] === "cat") {
                    resfil.forEach(fil => {
                        out += '<div class="row file">' + fil + '⠀⠀</div>';
                    })
                }
                document.getElementById("autocomplete").innerHTML = '<div class="row">' + out + '</div>';
            }
        }
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
    if (getDir(path)[0][0] === undefined) {
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

// TODO:
// - write disk data