var db  = {};
var mysql = require('mysql');
var pool = mysql.createPool({
 connectionLimit : 10,
 host:'localhost',//数据库地址
 port: 3306,//端口号
 user:'root',//数据库用户名
 //password:'lilei',//数据库密码
 password:'lilei',//数据库密码
 database:'text',//用的那个数据库
});
db.query = function(sql, callback){
  if (!sql) {
    callback();
    return;
  }
  pool.query(sql, function(err, rows, fields) {
   if (err) {
    console.log(err);
    callback(err, null);
    return;
   };
   callback(null, rows, fields);
  });
}
module.exports = db;
