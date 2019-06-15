<?php
/**
 * Created by PhpStorm.
 * User: houbaowen
 * Date: 2018/11/6
 * Time: 10:28
 */
// 拿到客户端发送过来的数据
$musicname = $_GET["musicName"];

// 创建服务器
$connection = mysqli_connect("127.0.0.1","root","253289","music");
if(!$connection){
    exit("数据库连接失败！");
}

// 设置字符集
mysqli_set_charset($connection,"utf8");

// 创建查询对象
$query = mysqli_query($connection,"select id from musics where song='$musicname'");

if(!$query){
    exit("创建查询对象失败!");
}
$row = mysqli_fetch_assoc($query);
// 输出
if($query){
    echo json_encode($row);
}