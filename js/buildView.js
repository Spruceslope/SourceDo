var fs = require('fs');
var stream = require('stream');

module.exports = (function () {
    var todoList = null,
        replace = new stream.Transform({objectMode: true});
    
    var build = function (todos) {
        todoList = todos;
        getViewTemplate();
    };
    
    replace._transform = function (chunk, encoding, done) {
        var todoBlocks = '';
        
        for (var a = 0; a < todoList.length; a++) {
            var commentBlock = '',
                codeBlock = '';
            
            for (var b = 0; b < todoList[a].commentBlock.length; b++) {
                commentBlock += todoList[a].commentBlock[b] + '<br>';
            }
            
            for (var b = 0; b < todoList[a].codeBlock.length; b++) {
                codeBlock += todoList[a].codeBlock[b];
            }
            
            todoList[a].template = todoList[a].template.replace('#commentBlock#', commentBlock).replace('#codeBlock#', codeBlock);
            
            todoBlocks += todoList[a].template;
        }
             
        this.push(chunk.replace('##BODY##', todoBlocks), encoding);        
        done();
    };
    
    var getViewTemplate = function (todos) {
        var readStream = fs.createReadStream('./views/template.html'),
            writeStream = fs.createWriteStream('./index.html');
        
        readStream.setEncoding('utf8');
        readStream.pipe(replace).pipe(writeStream);
    };
    
    return {
        build: build
    };
}());