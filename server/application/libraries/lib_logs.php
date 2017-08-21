<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
/**
* 
*/
class Lib_logs
{
	
	function __construct()
	{
		$this->log_activity_name = 'activity_logs.json';
		$this->path = FCPATH.'locker/logs/';
	}

	public function activity_log($message)
	{
		$l = array(
				'id_user' => $_SESSION['credential']['id_user'],
				'message' => $message,
				'timestamp' => strtotime(date('Y-m-d H:i:s')),
				'ip' => $_SERVER['REMOTE_ADDR'],
				'HTTP_X_FORWARDED_FOR' => @$_SERVER['HTTP_X_FORWARDED_FOR'],
			);
		$l = json_encode($l);
		$p = $this->log_path($this->log_activity_name);
		if(!is_file($p))
		{
			echo 'no file';
			// add to unusual stuff
		}else
		{
			$this->save_log($p, $l);
		}

	}

	public function save_log($path, $data)
	{
		$pdata = file_get_contents($path);
		$pdata .=$data.',';
		print_r($pdata);
		file_put_contents($path, $pdata);

	}
	public function log_path($logname)
	{
		return $this->path.$logname;
	}
}