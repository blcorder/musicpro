<?php
/**
 * Created by PhpStorm.
 * User: houbaowen
 * Date: 2018/11/1
 * Time: 16:25
 */

// 拿到前端传过来的数据
$id = $_GET["username"];

// 连接数据库
$connection = mysqli_connect("127.0.0.1","root","253289","music");

// 设置字符集
mysqli_set_charset($connection,"utf8");

// 判断数据库是否连接成功
if(!$connection){
    exit("数据库连接失败！");
}

// 创建数据对象
$query = mysqli_query($connection,"select * from musics where id=$id");

if($row = mysqli_fetch_assoc($query)){
    echo json_encode($row);
}