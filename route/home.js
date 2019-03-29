const express=require('express');
const bodyParser = require("body-parser");
//引入mysql封装插件
var db = require('../mysql.js');

module.exports=function (){
  var router=express.Router();
	//创建一个post请求
	// bodyParser.json() 设置请求头参数类型
  router.post('/cha',bodyParser.json(),function(req,res){//查
    var content=req.body;
    var sql = "select * from dyks where use_id='"+content.use_id+"' and tm like'%"+content.ceshi+"%'";
    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
        return;
      }
      res.status(200),
      res.json(rows);
    });
  });
  router.post('/gai',bodyParser.json(),function(req,res){//改
    var content=req.body;
    console.log("前台传过来的值 = "+content);
    var sql = "update dyks set tm='"+content.tm+"',xx='"+content.xx+"',zqdaan='"+content.zqdaan+"' where ID="+content.ID+"";
    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
        return;
      }
      res.status(200),
      res.json(rows);
    });
  });
  router.post('/shan',bodyParser.json(),function(req,res){//删
    var content=req.body.id;
    console.log("前台传过来的值 = "+content);
    var sql = "delete from dyks where ID = "+content+"";
    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
        return;
      }
      res.status(200),
      res.json(rows);
    });
  });
  router.post('/zeng',bodyParser.json(),function(req,res){//增
    var content=req.body;
    var sql = "insert into dyks (tm,xx,zqdaan,use_id) values ('"+content.tm+"','"+content.xx+"','"+content.zqdaan+"','"+content.use_id+"')";
    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
        return;
      }
      res.status(200),
      res.json(rows);
    });
  });

  return router;
};