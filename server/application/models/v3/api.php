<?php  

/**
* 
*/
class Api extends CI_Model
{
	private $allowed_params 	= ['fields', 'limit'];
	private $limit 				= 0;
	private $offset 			= 0;
	private $requested_parts 	= '';
	private $masked_fields 		= [];
	private $error 				= [];
	private $post 				= [];
	private $data_dependecy 	= [];
	private $data_dependecy_added 	= [];
	private $data_original_result 	= [];

	private $field_parametered 		= []; // array yang nantinya akan diisi field yang mempunyai parameter --> a,b(2),c(100)
	private $field_contain_fields 	= []; // array yang nantinya berisikan object fields yang ditulis didalam fields --> a,b.b1.b2(params1,params2),c,...

	private $db_table 				= [];
	private $data_advanced_processing_field = [];
	public 	$database;
	private $permitted;
	private $method 				= array();
	private $permitted_allowed 		= ['GET', 'POST'];
	private $bind_permitted_allowed = ['GET'];

	private $request_parts 			= [];


	function __construct()
	{
		# code...
		parent::__construct();
		// load configuration server
		include(APPPATH.'config/server.php');
		// set server_config sebagai class global parameter.
		$this->server_config 	= $server;
		// get request URI
		$request_uri 			= $_SERVER['REQUEST_URI'];
		$request_uri_arr 		= explode('/', $request_uri);
		if($request_uri_arr[0] == ''){array_shift($request_uri_arr);}
		
		array_shift($request_uri_arr);
		
		$request_uri_arr 			= implode('/', $request_uri_arr);
		$this->last_requested_url 	= $this->server_config['processing_server'].$request_uri_arr;
		$this->database 			= $this->db;
	}
	/*
	|------------------------------
	| Function untuk set request yang dapat diterima (GET|POST) atau passing request secara manual
	|------------------------------
	*/
	public function set_permitted_request_type($permitted = 'GET', $request = FALSE)
	{		
		if(!in_array($permitted, $this->permitted_allowed))
		{
			$this->set_error('404.1.1');
			return false;
		}

		$perm = '_'.$permitted;
		if(!isset($$perm) && !in_array($permitted, $this->bind_permitted_allowed))
		{
			$this->set_error('404.1.2');
			return false;
		}

		$this->permitted = $permitted;
		switch ($permitted) {
			default:
			case 'GET':
				$this->method = !$request? $_GET: $request;
				break;
			case 'POST':
				$this->method = !$request? $_POST : $request;
				break;
		}

	}
	
	/*
	|---------------------------------
	| Function untuk recognize active query Codeigniter (WHERE|IN|NOT_IN|etc)
	|---------------------------------
	*/
	public function active_query_recognizer($post)
	{
		// check if data in [1,2,3,4,...,n]
		// $post['in'] = array(array('id_article', array(32,31))); <-- how to use
		if(isset($post['in'])){ 
			foreach ($post['in'] as $key => $value) {
				$value[0] = $this->get_actual_value($value[0]);
				call_user_func_array(array($this->db, 'where_in'), $value); 
			}
		}
		// check if data not in [1,2,3,4,...,n]
		// $post['not_in'] = array(array('id_article', array(32,31))); <-- how to use
		if(isset($post['not_in'])){
			foreach ($post['not_in'] as $key => $value) {
				$value[0] = $this->get_actual_value($value[0]);
				call_user_func_array(array($this->db, 'where_not_in'), $value);
			}
		}
		// where 
		if(isset($post['_where_'])){ $this->db->where($post['_where_']); }
		// like
		if(isset($post['like'])){ 
			foreach ($post['like'] as $key => $value) {
				$value[0] = $this->get_actual_value($value[0]);
				call_user_func_array(array($this->db, 'like'), $value);
				// $this->db->like('');
			}
		}
		// not like
		if(isset($post['not_like'])){ $this->db->not_like($post['not_like']); }
		// group by
		if(isset($post['group_by'])){ $this->db->group_by($post['group_by']); }
		// order by
		if(isset($post['order_by'])){ $this->db->order_by($post['order_by']); }
		// having
		if(isset($post['where'])){ $this->db->having($post['where']); }
		if(isset($post['having'])){ $this->db->having($post['having']); }
		// limit & Offset
		$default_limit = 15;
		$default_offset = @$post['page'] == 1? 0 : (@$post['page']*$default_limit)-$default_limit;

		$post['limit'] = isset($post['limit'])? $post['limit'] : $default_limit.','.$default_offset;
		$limit = $post['limit'];
		call_user_func_array(array($this->db, 'limit'), explode(',', $limit));
	}

	

	/*
	|----------------------------
	| Function untuk pengecheckan apakan fields mengandung fields turunan.
	|----------------------------
	| --> fields => 'a,b,c,d.d1.d2.d3' (d1,d2,d3 adalah fields turunan)
	*/
	function recognize_field_contain_fields($data)
	{
		foreach ($data as $key => $value) {
			$fields 		= advance_explode($value,'.');
			$actual_field 	= array_shift($fields);
			$fields 		= implode(',', $fields);
			$data[$key] 	= $actual_field;
			$this->add_field_contain_fields($actual_field, $fields);
			// echo $fields;
		}
		return $data;
		
	}

	/*
	|--------------------------------------------
	| Tambahkan fields turunan kedalam records
	|--------------------------------------------
		@params 
		- $key s index name
		- $value :any nilai yang akan dimasukkan
	*/
	function add_field_contain_fields($key, $value)
	{
		if($key && $value)
		{
			$this->field_contain_fields[$key] = $value;
		}
	}
	/*
	|--------------------------------------------
	| ambil fields turunan kedalam records
	|--------------------------------------------
		@params 
		- $key --> index name
	*/
	function get_field_contain_fields($key = FALSE)
	{
		if($key) return isset($this->field_contain_fields[$key])?$this->field_contain_fields[$key]:array();
		return $this->field_contain_fields;
	}


	/*
	|--------------------------------------------
	| Function untuk pengechekan apakah fields memiliki parameter
	|--------------------------------------------
	| --> fields => a,b,c(10)
		@params 
		- $key o object yang akan dilakukan pengechekan
	*/
	function recognize_field_parametered($data = array())
	{
		foreach ($data as $key => $value) {
			$params = get_bracket_content($value);
			if(count($params) > 1)
			{
				$fields = str_replace($params[0], '', $value);
				$this->set_field_parametered($fields, $params[1]);
				// $this->add_requested_parts($fields);

				$data[$key] = $fields;
			}
		}
		return $data;
	}

	/*
	|--------------------------------------------
	| set fields turunan kedalam records
	|--------------------------------------------
		@params 
		- $key :s index name
		- $value :s|:i nilai yang akan dimasukkan 
	*/
	function set_field_parametered($key, $value)
	{
		if($key && $value)
		{
			$this->field_parametered[$key] = $value;
		}
	}
	/*
	|--------------------------------------------
	| ambil records fields yang memiliki parameter
	|--------------------------------------------
		@params 
		- $key s index name
	*/
	function get_field_parametered($key = FALSE)
	{
		if($key) return isset($this->field_parametered[$key])? $this->field_parametered[$key] : null;
		return $this->field_parametered;
	}

	/*
	|--------------------------------------------
	| set default requested parts
	|--------------------------------------------
		@params 
		- $data :o data yang akan dimasukkan 
	*/
	function set_requested_parts($data = array())
	{
		$this->requested_parts = $data;
	}

	/*
	|--------------------------------------------
	| tambahkan nilai kedalam records requested parts
	|--------------------------------------------
		@params 
		- $data :any data yang akan dimasukkan 
	*/
	function add_requested_parts($data = FALSE)
	{
		if(!$data) return false;
		array_push($this->requested_parts, $data);
	}

	/*
	|--------------------------------------------
	| ambil nilai kedalam records requested parts
	|--------------------------------------------
		@params 
		- $data :any data yang akan dimasukkan 
	*/
	function get_requested_parts()
	{
		return $this->requested_parts;
	}

	/*
	|----------------------
	| Set Dependecy
	|-----------------------
	*/
	public function set_dependency($data)
	{
		$this->data_dependecy = $data;
	}

	/*
	|----------------------
	| get Dependecy
	|-----------------------
	*/
	public function get_data_dependecy()
	{
		return $this->data_dependecy;
	}
	/*
	|----------------------
	| Function to recognize dependency
	|-----------------------
	*/
	public function recognize_dependency()
	{

		$dependecy = $this->get_data_dependecy();
		foreach ($dependecy as $key => $value) {
			$str = is_string($value)? explode(',', $value) : $value;
			foreach ($str as $k => $val) {
				$requested_parts = $this->get_requested_parts();
				if(!in_array($val, $requested_parts) && in_array($key, $requested_parts))
				{
					$this->add_requested_parts($val);
					$this->data_dependecy_added[] = $val;
				}
			}
			// check is available in masked_fields

		}
	}
	/*
	|----------------------
	| unset dependecy
	|-----------------------
	| Karena kita tidak ingin data dependency juga dikembalikan sebagai data yang ditampilkan ke user
	*/
	public function unset_dependency($res_db_result)
	{
		foreach ($this->data_dependecy_added as $key => $value) {
			foreach ($res_db_result->result_array() as $res_key => $res_value) {
				if(in_array($value, $this->requested_parts))
				{
					$res_db_result->remove_result($res_key, $value);
				}
				// print_r($res_key);
			}
		}
	}

	// used when there are no $_REQUEST || $_GET || $_POST
	public function set_default_fields($default = array())
	{
		require_once APPPATH."libraries/helper.php";

		$this->method['fields'] = isset($this->method['fields']) && !empty($this->method['fields'])? remove_all_whitespace($this->method['fields']) : remove_all_whitespace($default['fields']);
		$this->active_query_recognizer($this->method);
		$this->requested_fields($this->method['fields']);

	}
	public function masking_fields($masked_fields = array())
	{
		$this->reset_masking_fields();
		foreach ($masked_fields as $key => $value) {
			$this->masked_fields[$key] = $value;
		}
	}
	public function reset_masking_fields()
	{
			$this->masked_fields = array();
	}

	public function get_default_fields()
	{
		return $this->masked_fields;
	}

	public function query_form()
	{
		// $this->requested_parts = implode(glue, pieces)
		$def = $this->masked_fields;
		$req = [];
		$requested_parts = $this->get_requested_parts();

		foreach ($requested_parts as $key => $value) {

			$keys = array_keys($def);
			if(in_array($value, $keys))
			{
				$def[$value] = empty($def[$value])? '"'.$value.'"' : $def[$value];
				$req[$value] = $def[$value].' as '.$value;
			}
		}
		$def = array_values($req);
		return implode(',', $def);
	}

	/*
	|
	| Function untuk membaca fields yang di minta.
	|
	*/
	public function requested_fields($fields = array())
	{
		if(is_string($fields))
		{
			$fields = advance_explode($fields);
		}

		// read array_keys dari masked_fields
		$keys 		= array_keys($this->masked_fields);
		// melakukan pengecheckan jika fields memiliki parameter

		$fields = $this->recognize_field_contain_fields($fields);
		$fields = $this->recognize_field_parametered($fields);

		$key_diff 	= array_diff($fields, $keys);
		$key_assoc 	= array_intersect($fields, $keys);
		$this->set_requested_parts($key_assoc);
		if(count($key_diff) > 0)
		{
			foreach ($key_diff as $key => $value) {
				$this->set_error('404.2.1');
			}
		}
	}

	public function get_actual_value($key)
	{
		return isset($this->masked_fields[$key])? $this->masked_fields[$key] : $key;
	}

	public function advanced_processing_fields($data)
	{
		$this->data_advanced_processing_field = $data;

	}

	public function table($table)
	{
		$this->db->from($table);
	}
	public function compile()
	{
		if($this->is_error())
		{
			return $this->get_error();
		}

		$this->recognize_dependency();
		$select = $this->query_form();
		
		$this->db->select($select,FALSE);
		$result = $this->db->get();
		$e 		= $result->result_array();


		$this->data_original_result = $e;
		$requested_parts 			= $this->requested_parts;
		$advanced_process 			= $this->data_advanced_processing_field;

		$this->data_advanced_processing_field = array();
		$another_processing_fields 	= array();

		foreach ($advanced_process as $key => $value) {
			foreach ($e as $key_e => $value_e) {
				if(in_array($key, $requested_parts))
				{
					
					// execute function 
					$field_params = $this->get_field_parameter($key);
					$newval = $value($field_params, $value_e, $another_processing_fields);
					// pass the "another_processing_fields" result to next function
					$another_processing_fields[$key] = $newval;

					$result->change_result($key_e, $key, $newval);
				}
			}
			
		}
		$this->unset_dependency($result);

		return $result;
		// return $this->db;
	}

	public function get_field_parameter($fieldname)
	{
		$field_params 	= $this->get_field_parametered($fieldname);
		$field 			= $this->get_field_contain_fields($fieldname);
		$data['parameter'] = isset($field_params)? explode(',', $field_params) : array();
		$data['fields'] = $field;
		return $data;
	}

	private function error_list()
	{
		$error = array(
				'404.1.1' => 'Server has critical error when configure allowed permission type. ',
				'404.1.2' => 'Your method is not allowed. unexpectedly close the connection',
				'404.2.1' => 'One or some fields cant be recognized. please check again API document and your fields'
			);
		return $error;
	}

	private function get_error_value($error)
	{
		return $this->error_list()[$error];
	}

	public function set_error($code, $message = NULL)
	{
		$message = isset($message)?$message:$this->get_error_value($code);
		$this->error[] = array('code' => $code, 'message' => $message);		
	}
	
	public function get_error()
	{
		return $this->error;
	}

	public function is_error()
	{
		return count($this->get_error()) > 0? TRUE : FALSE;
	}

	public function debug()
	{
		foreach ($this->get_error() as $key => $value) {
			echo <<<EOF
			<h3>Error code {$value['code']}</h3>
			<div> {$value['message']} </div>
EOF;
		}
	}


	// BELOW here is Pagination's buddy
	public function pagination()
	{
		// get limit components
		$limit = $this->db->get_components('limit');
		// get offset components
		$offset = $this->db->get_components('offset');
		$offset = $offset>0?$offset:0;
		// set the limit and offset
		$this->set_limit($limit,$offset);

		// get request URI
		$request_uri = $_SERVER['REQUEST_URI'];
		$request_uri_arr = explode('/', $request_uri);
		if($request_uri_arr[0] == ''){array_shift($request_uri_arr);}
		array_shift($request_uri_arr);
		$request_uri_arr = implode('/', $request_uri_arr);
		$this->parse();
		$total = $this->db->count_all($this->db->get_components('from')[0]);
		$prev = $offset > 0? $this->generate_prev_request():NULL;
		$next = ($offset+$limit) < $total? $this->generate_next_request() : NULL;

		return array(
				'pages_length' => ceil(@$total/$limit),
				'current_page' => ceil($offset/$limit),
				'o' => $offset,
				'l' => $limit,
				'total' => $total,
				'next' => $next,
				'prev' => $prev,
			);
	}
	public function last_request()
	{
		return $this->last_requested_url;
	}
	private function parse_request()
	{
		return parse_url($this->last_request());
	}
	public function parse()
	{
		$parse = $this->parse_request();
		parse_str(@$parse['query'], $get_query);
		$requested_keys = array_keys($get_query);		
		$allowed_keys = array_intersect($this->allowed_params, $requested_keys);

		foreach ($allowed_keys as $key => $value) {
			$params = array();
			$key_value = $get_query[$value];
			$params[] = $this;
			$params[] = "parse_".$value;
			$this->request_parts[$value] = $key_value;
			call_user_func_array($params, array($key_value));
		}
	}

	private function parse_limit($value)
	{
		$val = explode(',',$value);
		$this->request_parts['limit'] = $val;
		$countVal = count($val);
		switch ($countVal) {
			default:
			case 1:
				$this->limit = $val[0];
				break;
			
			case 2:
				$this->limit = $val[0];
				$this->offset = $val[1];
				# code...
				break;
		}

	}


	public function set_limit($newLimit=0, $newOffset=0)
	{
		$this->limit = $newLimit;
		$this->offset = $newOffset>0?$newOffset:0;
		$this->request_parts['limit'] = array($this->limit, $this->offset);
	}
	public function add_limit($newLimit=FALSE)
	{
		$newLimit =$newLimit?$newLimit:$this->limit;
		$limit = $newLimit + $this->current_limit();
		// jika limit sekarang - limit sekarang < 1? 0 : limit sekarang
		$limit = $limit < 1? 0 : $limit;

		$offset = $this->current_offset() + $newLimit;
		$offset = $offset < 1? 0 : $offset;

		// $this->request_parts['limit'][0] = $limit;
		$this->request_parts['limit'][1] = $offset;

	}
	public function less_limit($newLimit = FALSE)
	{
		$newLimit =$newLimit?$newLimit:$this->limit;
		$limit = $newLimit - $this->current_limit();
		// jika limit sekarang - limit sekarang < 1? 0 : limit sekarang
		$limit = $limit < 1? 0 : $limit;

		$offset = $this->current_offset() - $newLimit;
		$offset = $offset < 1? 0 : $offset;

		// $this->request_parts['limit'][0] = $limit;
		$this->request_parts['limit'][1] = $offset;
	}
	public function current_limit()
	{
		return $this->limit;
	}
	public function current_offset()
	{
		return $this->offset;
	}
	public function is_using_limit()
	{
		return $this->limit>0?TRUE:FALSE;
	}

	public function generate_prev_request($page=FALSE)
	{
		if($this->is_using_limit())
		{
			$page = $page? $page*$this->current_limit() : $page;
			$this->less_limit($page);
			$parts = array();
			foreach ($this->request_parts as $key => $value) {
				$parts[$key] = is_array($value)? implode(',', $value) : $value;
			}
			$query = http_build_query($parts);
			return rtrim($this->server_config['processing_server'],'/').$_SERVER['PATH_INFO'].'?'.$query;
		}
	}
	public function generate_next_request($page=FALSE)
	{
		if($this->is_using_limit())
		{
			$page = $page? $page*$this->current_limit() : $page;
			$this->add_limit($page);
			$parts = array();
			foreach ($this->request_parts as $key => $value) {
				$parts[$key] = is_array($value)? implode(',', $value) : $value;
			}
			$query = http_build_query($parts);
			return rtrim($this->server_config['processing_server'],'/').$_SERVER['PATH_INFO'].'?'.$query;
		}
	}
	private function parse_fields($value)
	{
		// echo $value;
	}
	// Above here is Pagination's buddy

}