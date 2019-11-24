//服务器及页面响应部分
var express = require('express'),
    app = express(),
    //引入http模块
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),   //引入socket.io模块并绑定到服务器
    users = [];
//制定使用的html
app.use('/', express.static(__dirname + '/www'));
//将服务器绑定到3000端接口
//server.listen(3000);//用于本地测试
//http://127.0.0.1:3000   本地服务器接口
server.listen(process.env.PORT || 3000);//publish to heroku 注：Heroku免费云空间是一个经典的云空间平台
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);   注：OpenShift是红帽的云开发平台即服务（PaaS）
//处理 socket部分
// 建立连接             
// 作为闭包使用：(function(){  独立作用域  })();                   

io.sockets.on
('connection', function(socket) 
    {
        /*新用户登陆（login）*/
        //indexOf() 用来获取字符串值在字符串中首次出现的位置--查重
        //接收并处理客户端发送的login事件
        socket.on('login', function(nickname) {
            if (users.indexOf(nickname) > -1) {
                socket.emit('nickExisted');
            } else {
                //socket.userIndex = users.length;
                socket.nickname = nickname;
                users.push(nickname);
                socket.emit('loginSuccess');
                io.sockets.emit('system', nickname, users.length, 'login');
            };
        });
        //用户离开
        socket.on
        ('disconnect', function() 
            {
                if (socket.nickname != null) {
                    //用户连接
                    //users.splice(socket.userIndex, 1);
                    users.splice(users.indexOf(socket.nickname), 1);
                    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
                }
            }
        );
        //接收到新的消息
        socket.on('postMsg', function(msg, color) {
            socket.broadcast.emit('newMsg', socket.nickname, msg, color);
        });
        //接收到新的图片
        socket.on('img', function(imgData, color) {
            socket.broadcast.emit('newImg', socket.nickname, imgData, color);
        });
    }
);
