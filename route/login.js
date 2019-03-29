const express=require('express');
const bodyParser = require("body-parser");

const redis=require('redis');
//引入mysql封装插件
var db = require('../mysql.js');
//邮箱验证模块
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: '邮箱地址', //注册的163邮箱账号
        pass: '邮箱授权码' //邮箱的授权码，不是注册时的密码,等你开启的stmp服务自然就会知道了
});

var jwt = require('jsonwebtoken');//token
const crypto = require("crypto");//密码加密模块

var secretkey = 'secretkey';

module.exports=function (){
  var router=express.Router();

  router.post('/denglu',bodyParser.json(),function(req,res){//登陆
    var content=req.body;
    let md5 = crypto.createHash("md5");
    let newPas = md5.update(content.password).digest("hex");
	var sql = " select name,useid from login_table where username='"+content.username+"' and password='"+newPas+"'"
    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
        return;
      }else{
		  if(rows == false){
			  res.status(200),
			  res.json({ok: false, msg: '用户名或密码错误'});
		  }else{
			  var token = jwt.sign({username:content.username},secretkey,{expiresIn: 24 * 60 * 60 * 1000});
			  res.status(200),
              res.json({
                message: '请求成功',
                token: token,
                ok:true,
                name:rows[0].name,
                useid:rows[0].useid
              })		  
		  }
	  }
    });
  });

  function createSixNum(){//验证码为6位随机数
    var Num="";
    for(var i=0;i<6;i++){
      Num+=Math.floor(Math.random()*10);
    }
    return Num;
  } 
  function new_date() {//获取当前时间
    let dates = new Date();
    let nn = dates.getFullYear();//获取当前年
    let yy = dates.getMonth()+1;//获取当前月
    let rr = dates.getDate();//获取当前日并加24小时就是1天
    let ss = dates.getHours();//获取当前小时数(0-23)
    let ff = dates.getMinutes();//获取当前分钟数(0-59)
    let mm = dates.getSeconds();//获取当前秒
    let seperator1 = "-";
    let seperator2 = ":";
    return nn + seperator1 + yy + seperator1 + rr +" "+ ss + seperator2 + ff + seperator2 + mm;
  }
  router.post('/yanzhengma',bodyParser.json(),function(req,res){//邮箱验证
    var emails = req.body;//刚刚从前台传过来的邮箱
    let emailCode  = createSixNum();

    var client = redis.createClient(6379,'127.0.0.1');
    //添加redis
    client.on("connect",function(){
        client.set(emails.youxiang,emailCode,'EX', 600,function(err,response){
           if(err){
              console.log(err);
           }else{
            console.log(response);
              let email = {
                    title: '个人网站--邮箱验证码',
                    htmlBody: '<div style="text-align: center;"><h1>Hello!</h1><p style="font-size: 18px;color:#000;">您的验证码为：<u style="font-size: 16px;color:#1890ff;">'+ emailCode +'</u></p><p style="font-size: 14px;color:#666;">10分钟内有效</p><p>谢谢,<br>leizi</p></div>'
                  }
              let mailOptions = {
                    from: 'leizi<mckj_lil@163.com>', // 发件人地址
                    to: emails.youxiang, // 收件人地址，多个收件人可以使用逗号分隔
                    subject: email.title, // 邮件标题
                    html: email.htmlBody // 邮件内容
                  };
              transporter.sendMail(mailOptions, function(error, info){
                if(error) {
                  res.send({ok: false, msg: '验证码发送失败'});
                }else{
                  res.send({ok: true, msg: '验证码发送成功'});
                }
              });  
            }
        });
    });
  });

  router.post('/zhuce',bodyParser.json(),function(req,res){//注册  先判断用户名是否存在，然后再跟进不同的结果进行相应的操作
    var content=req.body;

    var client = redis.createClient(6379,'127.0.0.1');
    //添加redis
    client.on("connect",function(){
        client.get(content.youxiang,function(err,response){
          if(err){
              console.log(err);
           }else{
              if(response==null){
                res.json({ok: false, msg: '验证码失效，请重新获取'}); 
              }else{
                if(content.yanzhengma==response){
                  var sql = " select username from login_table where username='"+content.username+"'"
                  db.query(sql, function(err, rows, fields){
                    if (err) {
                      console.log(err);
                      return;
                    }else{
                    if(rows == false){
                      let md5 = crypto.createHash("md5");
                      let newPas = md5.update(content.password).digest("hex");
                      var useID="ID_s"
                      var sqls = "insert into login_table (username,password,name,useid,youxiang,newshijian) values ('"+content.username+"','"+newPas+"','"+content.name+"','"+useID+content.username+"','"+content.youxiang+"','"+new_date()+"')";
                      db.query(sqls, function(err, rows, fields){
                         if (err) {
                          console.log(err);
                          return;  
                        }
                        res.status(200),
                        res.send({ok: true, msg: '注册成功'});
                      });   
                      }else{
                      res.status(200),
                      res.json({ok: false, msg: '登录名已存在'});      
                      }
                    }
                  });
                }else{
                  res.json({ok: false, msg: '验证码不对，请重新输入'}); 
                }
              }
           }
        });
    });
  });

  return router;
};
