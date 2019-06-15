$(function () {
    // 所需要的全局变量
    let ullist = document.getElementById("songs-list");
    let touchstart = 'touchstart';
    let touchmove = 'touchmove';
    let touchend = 'touchend';
    let $body = $("#body");
    let $songsList = $("#songs-list");
    let $topBarLogo = $("#detail-top-bar-logo");
    let $detailPage = $("#detail-page");
    let $footerImg = $("#footer-img");
    let $audioMusic = $("#audio-music");
    let audioMusic = $("#audio-music").get(0);
    let parentH = $body.height(); // 列表可视区域的高
    let childH = $songsList.height(); // 音乐列表ul的高
    let onoff1 = true;
    let onoff2 = true;
    let onoff3 = false;
    let singleMusic = {}; // 空对象用来接收从服务端返回的单条数据
    let arr = []; //空数组用来存放歌词
    // 创建正则对象 处理歌词
    let reg = /\[[^[]+/g;

    // 整个项目的初始化
    function init() {
        let f = musicList();
        f();
    }
    // 音乐列表的操作
    let musicList = function () {
        // 定义相关变量
        let downY = 0; // 鼠标落下时的Y坐标
        let prevY = 0;
        let downT = 0; //
        let timer = null;
        let timer1 = null; // passTime 设置的定时器
        let speed = 0;
        let index = 0; // 上一首 下一首所用的索引
        let id = 0; //  每一首歌的唯一标识属性
        function init() {
            device();
            data();
            scrollMove();
            bind();
        }
        //兼容PC和移动端
        function device(){
            // console.log( navigator.userAgent );
            let isMobile = /Mobile/i.test(navigator.userAgent);
            if(!isMobile){
                touchstart = 'mousedown';
                touchmove = 'mousemove';
                touchend = 'mouseup';
            }
        }
        // 利用ajax 从服务端获取歌曲数据
        function data() {
            // 1.0 创建异步对象
            let xhr = new XMLHttpRequest();
            // 2.0 初始化请求
            xhr.open("GET","app.php",true);+
            // 3.0 发送请求
            xhr.send(null);
            // 4.0 监听状态
            xhr.onreadystatechange = function () {
                if(xhr.readyState === 4){
                    if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304){
                        let obj = JSON.parse(xhr.responseText);
                        for(let i=0;i<obj.length;i++){
                            let lis = '<li id='+(obj[i].id)+'>\n' +
                                '<span class="songs">'+ (obj[i].song) +'</span>\n' +
                                '<span class="singer" >'+ (obj[i].singer) +'</span>\n' +
                                '</li>';
                            ullist.innerHTML += lis;
                        }
                        childH = $songsList.height();
                    }
                }
            }
        }
        // 列表的滑动
        function scrollMove() {

            // 去掉默认行为
            $(document).on(touchmove,function(ev){
                ev.preventDefault();
            });
            // 绑定摁下事件
            $songsList.on(touchstart,function (e) {
                // 若ul的高度没有其父标签的高度高 那么不让其滑动
                if(parentH > childH){return false;}
                // 事件的兼容处理（兼容移动端）
                e = e || window.e;
                let touch = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;
                let This = this;
                downY = touch.pageY;
                onoff1 = true;
                onoff2 = true;
                clearInterval(timer);
                $(document).on(touchmove+'.move',function (e) {
                    downT = $(This).position().top;
                    e = e || window.e;
                    let touch = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e;
                    let iTop = $(This).position().top;
                    speed = touch.pageY - prevY;
                    prevY = touch.pageY;

                    if(iTop > 0){ //头
                        if(onoff1){
                            onoff1 = false;
                            downY = touch.pageY;
                        }
                        $(This).css('transform','translate3d(0,'+(touch.pageY - downY+ downT)/3+'px,0)');

                    }else if(iTop < (parentH-childH)){ //尾部
                        if(onoff2){
                            onoff2 = false;
                            downY = touch.pageY;
                        }
                        $(This).css('transform','translate3d(0,'+( (touch.pageY - downY)/3+(parentH - childH) )+'px,0)');

                    }else{

                        $(This).css('transform','translate3d(0,'+(touch.pageY - downY + downT)+'px,0)');
                    }
                });
                $(document).on(touchend+'.move',function () {
                    // 取消事件
                    $(this).off('.move');
                    clearInterval(timer);
                    timer = setInterval(function(){
                        var iTop = $(This).position().top;
                        if(Math.abs(speed) <= 1 || iTop > 50 || iTop < parentH - childH - 50){
                            clearInterval(timer);
                            if(iTop >= 0){
                                $(This).css('transition','.2s');
                                $(This).css('transform','translate3d(0,0,0)');
                            }
                            else if(iTop <= parentH - childH){
                                $(This).css('transition','.2s');
                                $(This).css('transform','translate3d(0,'+(parentH - childH)+'px,0)');
                            }
                        }
                        else{
                            speed *= 0.9;
                            $(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
                        }
                    },13);
                });
                $songsList.on('transitonend webkitTransitionEnd',function(){
                    $(this).css('transition','');
                });

            })
        }
        // 监听事件
        function bind() {
            // 提交form表单
            $("#search-btn").on('click',function () {
                let str = $("#search-input").val();
                // 创建异步对象
               let xhr = new XMLHttpRequest();
               // 预发送数据
                xhr.open("GET","search.php?musicName="+(encodeURIComponent(str)),true);
                // 发送请求
                xhr.send(null);
                // 监听状态变化
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === 4){
                        if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ){
                            let obj = JSON.parse(xhr.responseText);
                            if(obj !== null){
                                // 拿到搜索到歌曲所在标签的索引 让搜索到的歌曲跑到顶部
                                let searchIndex = $('#' + obj.id).index();
                                let liLength = $("#songs-list").find('li').length;
                                let liHeight = $("#songs-list").find('li').eq(1).outerHeight();
                                // 设置搜索到歌曲的样式
                                $('#' + obj.id).addClass("active4").siblings().removeClass("active4");
                                // console.log(searchIndex);
                                if(searchIndex < liLength -8){
                                    $("#songs-list").css('transition','.5s');
                                    $("#songs-list").css("transform",'translate3d(0,'+ -searchIndex*liHeight +'px,0)');
                                }else{
                                    $("#songs-list").css('transition','.5s');
                                    $("#songs-list").css("transform",'translate3d(0,'+ -(liLength -8)*liHeight +'px,0)');
                                }
                            }else{
                                alert("实在抱歉！此歌曲没有版权！");
                            }
                        }else{
                            console.log(xhr.status);
                        }
                    }
                }
                // $.ajax({
                //
                // })
            });
            // 发送ajax请求获取单一歌曲的各个字段值
            function getSingleMusic(id){
                // 发送ajax请求
                let xhr = new XMLHttpRequest();
                xhr.open("GET","music.php?username="+(encodeURIComponent(id)),true);
                xhr.send(null);
                xhr.onreadystatechange = function(){
                    if(xhr.readyState === 4){
                        if(xhr.status >=200 && xhr.status <300 || xhr.status === 304){
                            singleMusic = JSON.parse(xhr.responseText);
                            // console.log(singleMusic);
                            // 将请求到的值赋给相应的标签
                            $("#First-page-song").text(singleMusic.song);
                            $("#First-page-singer").text(singleMusic.singer);
                            $("#detail-page-song").text(singleMusic.song);
                            $("#detail-page-singer").text(singleMusic.singer);
                            $('#'+ id +'>.songs').text(singleMusic.song);
                            $('#'+ id +'>.singer').text(singleMusic.singer);
                            $("#footer-img").attr("src",'./images/'+singleMusic.img);
                            $("#lyric-left-img").attr("src",'./images/'+singleMusic.img);
                            $audioMusic.attr("src",'./images/music/'+singleMusic.mus);
                            $("#lyric-list").empty();
                            $("#lyric-list").css("transform",'translate3d(0,0,0)');
                            let lyric = singleMusic.lyric;
                            // console.log(lyric);
                            if(lyric === null){
                                // 播放
                                controlBtn1()
                            }else{
                                // 处理歌词
                                arr = lyric.match(reg);
                                // console.log(arr);
                                for(let i=0;i<arr.length;i++){
                                    arr[i] = [formatTime1(arr[i].substring(0,10)),arr[i].substring(10).trim()];
                                    // console.log(arr[i][0],arr[i][1]);
                                }
                                // 为每一句歌词创建li标签 并加入到ul中
                                for(let i=0;i<arr.length;i++){
                                    $("#lyric-list").append($('<li>'+ arr[i][1]+'</li>'));
                                }
                                // 播放
                                controlBtn1();
                            }
                        }
                    }
                };
            }
            // 按钮控制播放
            function controlBtn1(){  // 播放
                $("#footer-btn").css("background","url(./images/list_audioPause.png)");
                $("#footer-btn").css("backgroundSize","cover");
                $("#detail-pause-btn").css("background","url(./images/details_pause.png)");
                $("#detail-pause-btn").css("backgroundSize","cover");
                $("#footer-img").css("animationPlayState","running");
                $("#lyric-left-img").css("animationPlayState","running");
                $("#footer-img").addClass("rotate");
                $("#lyric-left-img").addClass("rotate");
                audioMusic.play();
                clearInterval(timer1);
                timer1 = setInterval(function () {
                    // 载入歌曲已播放的部分和歌曲的剩余时间时间
                    $("#pass-time").html(formatTime(audioMusic.currentTime));
                    $("#footer-control-pass-time").html(formatTime(audioMusic.currentTime));
                    $("#total-time").html(formatTime(audioMusic.duration-audioMusic.currentTime));
                    $("#footer-control-total-time").html(formatTime(audioMusic.duration));
                    // 设置已经播放部分的蓝条 和圆点的同步滚动
                    $("#bottom-bar-btn").css("left",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    $("#footer-control-circle").css("left",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    $(".pass-bottom-bar").css("width",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    $("#footer-control-pass-bar").css("width",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    // 判断歌曲是否播放结束 结束之后进入下一曲
                    let passTime = Math.ceil(audioMusic.currentTime);
                    let totalTime = Math.ceil(audioMusic.duration);
                    if(passTime===totalTime){
                        changeMusic(false);
                    }
                    // 滚东歌词
                    scrollLyric(audioMusic.currentTime);
                },1000);
            }
            // 滚动歌词
            function scrollLyric(currentTime) {
                let liHeight = $("#lyric-list").find("li").eq(0).outerHeight(true);
                for(let i=0;i<arr.length;i++){
                    if( i !== arr.length-1 && currentTime>arr[i][0] && currentTime<arr[i+1][0]){
                        // 处理英文歌词的翻译 两行同时给样式
                        // console.log(arr[i][0]);
                        // console.log(arr[i -1][0]);
                        if(arr[i][0] == arr[i-1][0]){
                            $("#lyric-list").find("li").eq(i).addClass("active3").nextAll().removeClass("active3");
                            $("#lyric-list").find("li").eq(i).prev().addClass("active3").prevAll().removeClass("active3");
                        } else{
                            $("#lyric-list").find("li").eq(i).addClass("active3").siblings().removeClass("active3");
                        }
                        // 当歌词到第六行是 让歌词所在的ul滚动
                        if(i>4){
                            $("#lyric-list").css("transform",'translate3d(0,'+ -(i-4)*liHeight +'px ,0)');
                        }else{
                            $("#lyric-list").css("transform",'translate3d(0,0,0)');
                        }
                    }else if(i == arr.length-1 && currentTime>arr[i][0]){
                        // 处理英文歌词的翻译 两行同时给样式
                        if(arr[i][0] === arr[i-1][0]){
                            $("#lyric-list").find("li").eq(i).addClass("active3").nextAll().removeClass("active3");
                            $("#lyric-list").find("li").eq(i).prev().addClass("active3").prevAll().removeClass("active3");
                        } else{
                            $("#lyric-list").find("li").eq(i).addClass("active3").siblings().removeClass("active3");
                        }
                        // 让歌词所在的ul滚动
                        $("#lyric-list").css("transform",'translate3d(0,'+ -(i-4)*liHeight +'px ,0)');
                    }
                }
            }
            function controlBtn2() { // 暂停
                $("#footer-btn").css("background","url(./images/list_audioPlay.png)");
                $("#footer-btn").css("backgroundSize","cover");
                $("#detail-pause-btn").css("background","url(./images/details_play.png)");
                $("#detail-pause-btn").css("backgroundSize","cover");
                $("#footer-img").css("animationPlayState","paused");
                $("#lyric-left-img").css("animationPlayState","paused");
                $audioMusic[0].pause();
                clearInterval(timer1);
            }
            function controlBtn(){ // 按钮控制的播放和暂停
                if(onoff3){
                    onoff3 = false;
                    // 播放
                    controlBtn1();
                    // $("#footer-btn").css("background","url(./images/list_audioPause.png)");
                    // $("#footer-btn").css("backgroundSize","cover");
                    // $("#detail-pause-btn").css("background","url(./images/details_pause.png)");
                    // $("#detail-pause-btn").css("backgroundSize","cover");
                    // $("#footer-img").addClass("rotate");
                    // $("#lyric-left-img").addClass("rotate");
                    // $("#footer-img").css("animationPlayState","running");
                    // $("#lyric-left-img").css("animationPlayState","running");
                    // audioMusic.play();
                    // clearInterval(timer1);
                    // timer1 = setInterval(function () {
                    //     // 载入歌曲已播放的部分和歌曲的剩余时间时间
                    //     $("#pass-time").html(formatTime(audioMusic.currentTime));
                    //     $("#footer-control-pass-time").html(formatTime(audioMusic.currentTime));
                    //     $("#total-time").html(formatTime(audioMusic.duration-audioMusic.currentTime));
                    //     $("#footer-control-total-time").html(formatTime(audioMusic.duration));
                    //     // 设置已经播放部分的蓝条 和圆点的同步滚动
                    //     $("#bottom-bar-btn").css("left",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    //     $("#footer-control-circle").css("left",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    //     $(".pass-bottom-bar").css("width",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    //     $("#footer-control-pass-bar").css("width",(audioMusic.currentTime/audioMusic.duration)*100 +'%');
                    //     let passTime = Math.ceil(audioMusic.currentTime);
                    //     let totalTime = Math.ceil(audioMusic.duration);
                    //     if(passTime===totalTime){
                    //         changeMusic(false);
                    //     }
                    // },1000);
                }else{
                    onoff3 = true;
                    // 暂停
                    controlBtn2();
                    // $("#footer-btn").css("background","url(./images/list_audioPlay.png)");
                    // $("#footer-btn").css("backgroundSize","cover");
                    // $("#detail-pause-btn").css("background","url(./images/details_play.png)");
                    // $("#detail-pause-btn").css("backgroundSize","cover");
                    // $("#footer-img").css("animationPlayState","paused");
                    // $("#lyric-left-img").css("animationPlayState","paused");
                    // $audioMusic[0].pause();
                    // clearInterval(timer1);
                }
            }
            // 格式化时间
            function formatTime(num) {
                num = parseInt(num);
                let minutes = Math.floor(num%3600/60); // 分钟
                let seconds = Math.floor(num%60); // 秒数
                if(minutes<10 && seconds>=10){
                    return '0'+minutes +':'+seconds;
                }else if(minutes >=10 && seconds <10){
                    return minutes + ':'+ '0'+seconds;
                }else if(minutes<10 && seconds<10){
                    return '0'+ minutes + ':'+'0'+seconds;
                }else{
                    return minutes +':'+seconds;
                }
            }
            function formatTime1(num) {
                num = num.substring(1,num.length-1);
                let str = num.split(":");
                return (parseFloat(str[0] * 60) + parseFloat(str[1]));
            }
            // 左右切歌
            function changeMusic(judge){
                onoff3 = false;
                let $li = $songsList.find('li');
                if(judge){
                    index = index == 0 ? $li.length - 1 : index - 1;
                }else{
                    index = index == $li.length - 1 ? 0  : index + 1;
                }
                id = $li.eq(index).attr("id");
                $li.eq(index).addClass("active").siblings().removeClass("active");
                $li.eq(index).children("span").css("color"," #c52f2f");
                $li.eq(index).siblings().children("span:odd").css("color","#b3b3b3");
                $li.eq(index).siblings().children("span:even").css("color","white");
                $("#footer-img").removeClass("rotate");
                $("#lyric-left-img").removeClass("rotate");
                getSingleMusic(id);
            }
            // 歌曲列表的点击事件
            // $songsList.delegate("li","click",function () {
            //     $(this).children("span").css("color"," #c52f2f");
            //     $(this).siblings().children("span:odd").css("color","#b3b3b3");
            //     $(this).siblings().children("span:even").css("color","rgba(255,255,255,0.8)");
            //     $(this).css("backgroundColor","#2c2e32").siblings().css("backgroundColor","rgba(26,26,26,0.6)");
            // });
            $songsList.delegate("li",'dblclick',function () {
                $("#footer-btn").css("display","block");
                $("#footer-pre-btn").css("display","block");
                $("#footer-next-btn").css("display","block");
                $(this).addClass("active").siblings().removeClass("active");
                $(this).children("span").css("color"," #c52f2f");
                $(this).siblings().children("span:odd").css("color","#b3b3b3");
                $(this).siblings().children("span:even").css("color","white");
                // 每首歌曲的id值
                id = $(this).attr("id");
                index = $(this).index();
                getSingleMusic(id);
            });
            // 详情页的收取
            $topBarLogo.on("click",function () {
                $detailPage.css('transition','.5s');
                // $detailPage.css("zIndex","-100");
                $detailPage.css('transform','translate3d(0,'+900+'px,0)');

            });
            $(".footer-img-cover").on("click",function () {
                $detailPage.css('transition','.5s');
                $detailPage.css('display','block');
                $detailPage.css('transform','translate3d(0,0,0)');
            });
            // 鼠标的进入和离开
            $footerImg.on("mouseover",function () {
               $(".footer-img-cover") .css("display","block");
            });
            $(".footer-img-cover").on("mouseleave",function () {
                $(".footer-img-cover") .css("display","none");
            });
            // 首页的按钮控制播放
            $("#footer-btn").on('click',function () {
                controlBtn();
            });
            // 详情页的按钮控制播放
            $("#detail-pause-btn").on('click',function () {
                controlBtn();
            });
            // 点击上一首
            $("#detail-pre-btn").on('click',function () {
                changeMusic(true);
            });
            $("#footer-pre-btn").on('click',function () {
                changeMusic(true);
            });
            // 点击下一首
            $("#detail-next-btn").on('click',function () {
                changeMusic(false);
            });
            $("#footer-next-btn").on('click',function () {
                changeMusic(false);
            });
            // 轮播的切换
            $("#bottom-slide-1").on('click',function () {
                $(this).addClass("active1").siblings().removeClass("active1");
                $(".detail-lyric").fadeIn(500);
                $(".detail-bottom").fadeIn(500);
            });
            $("#bottom-slide-2").on('click',function () {
                $(this).addClass("active1").siblings().removeClass("active1");
                $(".detail-lyric").fadeOut(500);
                $(".detail-bottom").fadeOut(500);
            });
            // 歌曲进度的拖动 1
            $("#footer-control-circle").on("mousedown",function (e) {
                e = e || window.e;
                $(document).on("mouseover",function (e) {
                    e = e || window.e;
                    let endPoint = e.pageX - $(".footer-control-bar").offset().left;
                    let barLength = $(".footer-control-bar").outerWidth(true);
                    if(endPoint < 0){
                        endPoint = 0;
                    }else if(endPoint > barLength){
                        endPoint = barLength;
                    }
                    $("#footer-control-pass-bar").css("width",(endPoint/barLength)*100+'%');
                    $("#footer-control-circle").css("left",(endPoint/barLength)*100+'%');
                    audioMusic.currentTime = (endPoint/barLength)*audioMusic.duration;
                })
            });
            $(document).on("mouseup",function () {
                $(this).unbind("mouseover");
            });
            // 歌曲进度的拖动 2
            $("#bottom-bar-btn").on("mousedown",function () {
                $(document).on("mouseover",function (e) {
                    e = e || window.e;
                    // console.log(e.pageX,$("#bottom-bar").offset().left);
                    let endPoint = e.pageX - $("#bottom-bar").offset().left;
                    let barLength = $("#bottom-bar").outerWidth();
                    // console.log(endPoint, barLength);
                    if(endPoint < 0){
                        endPoint = 0;
                    }else if(endPoint > barLength){
                        endPoint = barLength;
                    }
                    $("#pass-bottom-bar").css("width",(endPoint/barLength)*100+'%');
                    $("#bottom-bar-btn").css("left",(endPoint/barLength)*100+'%');
                    audioMusic.currentTime = (endPoint/barLength)*audioMusic.duration;
                })
            });
            $(document).on("mouseup",function () {
                $(this).unbind("mouseover");
            })
        }
        return init;
    };
    init();
});


