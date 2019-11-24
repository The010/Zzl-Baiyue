
/*一些基本的前端js开始实现连接功能。
定义一个全局变量用于我们整个程序的开发HiChat
同时使用window.onload在页面准备好之后实例化HiChat，
调用其init方法运行我们的程序*/
window.onload = function() 
{
    //实例并初始化该程序
    var hichat = new HiChat();
    hichat.init();
};

//定义该程序的类
var HiChat = function() 
{
    this.socket = null;
};

//向原型添加业务的方法
HiChat.prototype = 
{
    init: function() 
    {
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的事件，此事件表示连接已建立
        this.socket.on
        ('connect', function() 
            {
                //连接到服务器后，显示昵称输入框
                document.getElementById('info').textContent = 'get yourself a nickname :)';
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();
            }
        );

        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });
        this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            that._displayNewMsg('system ', msg, 'red');
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });

        // document.getElementById(ID)//获得指定id值的对象
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        // 在输入昵称后，按回车键就可以登陆，进入聊天界面后，回车键可以发送消息。
        document.getElementById('sendBtn').addEventListener
        ('click', function() 
            {
                var messageInput = document.getElementById('messageInput'),
                    msg = messageInput.value,
                    //获取颜色值
                    color = document.getElementById('colorStyle').value;
                messageInput.value = '';
                messageInput.focus();
                if (msg.trim().length != 0) 
                {
                    //显示和发送时带上颜色值参数
                    that.socket.emit('postMsg', msg, color);
                    that._displayNewMsg('me', msg, color);
                    return;
                };
            }, false
        );

        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        // 关于表情包的调用
        // 表情按钮单击显示表情窗口
        this._initialEmoji();
        document.getElementById('emoji').addEventListener
        ('click', function(e) 
            {
                var emojiwrapper = document.getElementById('emojiWrapper');
                emojiwrapper.style.display = 'block';
                e.stopPropagation();
            }, false
        );
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });

        // 图片的click事件处理程序
        document.getElementById
        ('emojiWrapper').addEventListener('click', function(e) 
            {
                //获取被点击的表情
                var target = e.target;
                if (target.nodeName.toLowerCase() == 'img') 
                {
                    var messageInput = document.getElementById('messageInput');
                    messageInput.focus();
                    messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
                };
            }, false
        );
    },

    // 点击页面其他地方关闭表情窗口
    _initialEmoji: function() 
    {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },

    _displayNewMsg: function(user, msg, color) 
    {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
             //将消息中的表情转换为图片
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    // 如果有表情符号则转换为img标签，然后返回处理好的文本消息，最中就会将图片显示到页面。
    _showEmoji: function(msg) 
    {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) 
            {
                result = result.replace(match[0], '[X]');
            } else 
            {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
