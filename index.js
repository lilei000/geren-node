const express = require('express');//引入node-web框架
const cookieParser=require('cookie-parser');
const cookieSession=require('cookie-session');
const expressRoute=require('express-route');
const multer=require('multer');
const bodyParser = require("body-parser");
const app = express();//创建一个node框架
var jwt = require('jsonwebtoken');//token
var secretkey = 'secretkey';


app.use(bodyParser.urlencoded({ extended: false }));
app.all('*', function(req, res, next) {             //设置跨域访问  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
 });
 

app.use('/',bodyParser.json(),function(req,res,next){
  // console.log(req.url);
  if(req.url !='/api/login/denglu' && req.url !='/api/login/zhuce' && req.url !='/api/login/yanzhengma'){
        //token可能存在post请求和get请求
        let token = req.body.token || req.query.token || req.headers.token;
        jwt.verify(token,secretkey,function(err,decode){
           if(err){
               res.json({
                   message: 'token过期，请重新登录',
                   resultCode: '403'
               })
           }else{
               next();
           }
        })
  }else{
        next();
    }
});
 

app.use('/api/login', require('./route/login.js')());
app.use('/api/home', require('./route/home.js')());

var server = app.listen(3002,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('listen at http://%s:%s',host,port)
})
