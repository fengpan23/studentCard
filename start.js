var fs = require('fs');
var xlsx = require('node-xlsx');
var walk = require('walk');
var _ = require('underscore');

var cardgen = require('cardgen');

function trim(s) {
  return s.replace(/(^\s*)|(\s*$)/g, "");
}

function cvsload(root, filename) {
  var path = root + '/' + filename;
  var obj = xlsx.parse(path);
  var data = obj[0].data;

  for (i in data) {
    if (i < 2) {
      continue;
    }
    var stu = {};
    stu.stu_school = data[i][0];
    stu.stu_grade = data[i][1];
    stu.stu_class = data[i][2];
    stu.stu_name = data[i][4];
    stu.serial_number = data[i][5];

    var schoolname = stu.stu_school;
    if(!schoolname){
      continue;
    }else{
      schoolname = trim(stu.stu_school);
    }

    if(schoolname.indexOf('南宫市') >=0){
       schoolname = schoolname.replace('南宫市', '');
    }else if(schoolname.indexOf('南宫') >= 0){
       schoolname = schoolname.replace('南宫', '');
    }
     schoolname = '南宫市' + schoolname;
    //get Most appropriate image
    var studentname = getBestFit(root, stu.stu_name);
    if (!studentname) {
      fs.appendFile(__dirname + '/log/' + schoolname + '.txt', root + '/' + stu.stu_name + '\r\n', function(err) {});
      continue;
    }

    try {
      var resolvedPath = root + '/' + studentname;
      var params = {
        school: schoolname,
        name: stu.stu_name,
        serial: stu.serial_number,
      };
      console.log(resolvedPath);
      // cardgen.generate(resolvedPath, params, __dirname + '/card/' +schoolname + '/' + stu.stu_grade + '/' + stu.stu_class);
      cardgen.generate(__dirname + '/' + resolvedPath, params, __dirname + '/card/' + root + '/');
    } catch (err) {
      fs.appendFile(__dirname + '/' + root + '/log.txt', err.path + '\r\n', function(err) {});
    }
  }
}

options = {
  followLinks: false,
  filters: ["Temp", "_Temp"]
};
walker = walk.walk('convert_box/第二中学', options);
walker.on("file", function(root, fileStats, next) {
  var filename = fileStats.name;
  if (filename.indexOf('.xlsx') > 1) {
    cvsload(root, filename);
  }
  next();
});
walker.on("names", function(root, nodeNamesArray) {
  nodeNamesArray.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
});

function getBestFit(folder, name) {
  var bitName = name;
  options = {
    listeners: {
      names: function(root, nodeNamesArray) {
        bitName = _.find(nodeNamesArray, function(nodeName) {
          return nodeName.replace('.jpg', '') === name;
        });
        if (!bitName) {
          bitName = _.filter(nodeNamesArray, function(nodeName) {
            return nodeName.indexOf(name) >= 0;
          });
        }
      }
    }
  };
  walk.walkSync(folder, options);
  return _.isArray(bitName) ? bitName[0] : bitName;
}