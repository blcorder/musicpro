<?php
/**
 * Created by PhpStorm.
 * User: houbaowen
 * Date: 2018/10/29
 * Time: 8:49
 */

// 连接数据库
$connection = mysqli_connect("127.0.0.1","root","253289","music");

// 设置字符集
mysqli_set_charset($connection,"utf8");

// 判断是否连接成功
if(!$connection){
    exit("数据库连接失败！");
}

// 创建数据对象
$query = mysqli_query($connection,"select id, singer,song from musics");
$rows = mysqli_affected_rows($connection);
if($rows){
    while($row = mysqli_fetch_assoc($query)){
    $data[] = $row;
}
echo json_encode($data);
}



