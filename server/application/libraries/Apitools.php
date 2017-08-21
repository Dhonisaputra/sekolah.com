<?php
/**
* 
*/
class Apitools
{
	
	function __construct()
	{
		# code...
		$this->value_delimiter= ':';
	}

	public function extract_url($fields)
	{
		$q = $fields;
		$q = explode(',', $q);
		$nq = array();
		foreach ($q as $key => $value) {
			$str = explode($this->value_delimiter, $value);
			if(count($str) > 1)
			{
				$q[$key] = $str[0];
				$nq[$str[0]] = $str[1];
			}
		}
		return array(
				'fields' => $q,
				'fields_valued' => $nq,
			);

	}
}