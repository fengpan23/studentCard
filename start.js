var fs = require('fs');
var xlsx = require('node-xlsx');
var walk = require('walk');

var toCard = require('./index');

function cvsload(root, filename) {
  //清除错误记录文件
  fs.unlink(root + '/message.txt', function(err, mess) {
    // console.log(err);
    // console.log(mess);
  })

  var path = root + '/' + filename;
  var obj = xlsx.parse(path);
  //第一个工作表的数据
  var data = obj[0].data;

  for (i in data) {
    if (i < 2) {
      continue;
    }
    var stu = {};
    stu.stu_school = data[i][0];
    stu.stu_name = data[i][4];
    stu.serial_number = data[i][5];

    try{
      var resolvedPath = fs.realpathSync(root + '/' + stu.stu_name + '.jpg');
      var schoolname = stu.stu_school;
      if(schoolname.indexOf('南宫市') !== 0){
          schoolname = '南宫市' + schoolname;
      }
      console.log(resolvedPath);
      toCard.createStudentCard(schoolname, stu.stu_name, stu.serial_number, resolvedPath);
    }catch(err){
      fs.appendFile(root + '/message.txt', err.path + '\r\n', function(err) {});
    }
  }
}

options = {
  followLinks: false,
  filters: ["Temp", "_Temp"]
};
walker = walk.walk('convert_box', options);
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