<?php 

function getRandomString($length = 8, $onlyNumber = TRUE) {
    $characters = '0123456789';
    if(!$onlyNumber)
    {
    	$characters .= 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    $string = '';

    for ($i = 0; $i < $length; $i++) {
        $string .= $characters[mt_rand(0, strlen($characters) - 1)];
    }

    return $string;
}