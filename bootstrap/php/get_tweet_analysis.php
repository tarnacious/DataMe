<?php
// Config
$dbhost = 'localhost';
$dbname = 'dw';

// Connect to test database
$m = new Mongo("mongodb://$dbhost");
$db = $m->$dbname;

// select the collection
$collection = $db->analysis;

// pull a cursor query
$cursor = $collection->find();

$return = array();
    $i=0;
    while( $cursor->hasNext() )
    {

        $return[$i] = $cursor->getNext();
        // key() function returns the records '_id'
        $return[$i++]['_id'] = $cursor->key();
    }
    echo json_encode($return);

//if($cursor->hasNext())
//{
//    echo json_encode(iterator_to_array($cursor));
//}
?>
