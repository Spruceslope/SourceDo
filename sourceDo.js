var fs = require('fs');
var stream = require('stream');
var Q = require('q');
var findFiles = require('./js/findFiles');
var buildView = require('./js/buildView');

var path = 'C:/Users/ef35oi/INGProjects/ponboardingwa/pOnboardingWAApp/app/js',
    todoStarted = false,
    commentStarted = false,
    todoList = [],
    todo = null;


function Todo() {
    this.fileName = '';
    this.template = '<div class="todo"><div class="comment-block">#commentBlock#</div><div class="code-block"><pre>#codeBlock#</pre></div></div>';
    this.commentBlock = [];
    this.codeBlock = [];
};

var run = function () {
    findFiles.inDir(path, '.js')
        .then(function (files) {
            readFileLineByLine(files, function () {
                buildView.build(todoList);
            });
        });
}

var readFileLineByLine = function (files, fn) {
    var fileList = [],
        iterator = 0;
    
    for (var folder in files) {
        for (var a = 0; a < files[folder].length; a++) {
            fileList.push(files[folder][a]);
        }
    }
    
    var parse = function () {
        var fileName = fileList[iterator].substring((fileList[iterator].lastIndexOf('\\')+1), fileList[iterator].length),
            fileStream = fs.createReadStream(fileList[iterator]),
            liner = new stream.Transform({objectMode: true}),
            deferred = Q.defer();
        
        fileStream.setEncoding('utf8');
        fileStream.pipe(liner);
        
        liner._transform = function (chunk, encoding, done) {
             var data = chunk.toString();
             if (this._lastLineData) data = this._lastLineData + data ;

             var lines = data.split('\n');
             this._lastLineData = lines.splice(lines.length-1,1)[0];

             lines.forEach(this.push.bind(this));
             done();
        }

        
        liner.on('readable', function (err) {
            //if (err) throw err;
            var line;

            while (line = liner.read()) {
                parseTodos(line, fileName);
            }
        }).on('end', function (err) {
            deferred.resolve();
            
            if (iterator < (fileList.length-1)) {
                iterator++;
                parse();
            } else {
                fn();
            }
        });
    };
    
    parse();
};

var parseTodos = function (line, fileName) {
    var commentStartExp = new RegExp(/^\/\* TODO/i),
        commentEndExp = new RegExp(/^\*\//),
        todoEndExp = new RegExp(/^\/\* END \*\//i),
        ln = line.trim();

    if (!commentStarted && commentStartExp.test(ln)) {
        commentStarted = true;
        todo = new Todo();
        todo.fileName = fileName;
    }

    if (commentStarted && !commentStartExp.test(ln) && !commentEndExp.test(ln)) {
        todo.commentBlock.push(ln);
    }

    if (commentStarted && commentEndExp.test(ln)) {
        commentStarted = false;
        todoStarted = true;
    }

    if (todoStarted && !todoEndExp.test(ln) && !commentEndExp.test(ln)) {
        todo.codeBlock.push(line);
        console.log(line)
    }

    if (todoStarted && todoEndExp.test(ln)) {
        todoStarted = false;
        todoList.push(todo);
    }
};

run();