<?php
    require_once('connect.php');
    $query = "select * from `commodities`";
    $result = $con->query($query);
    
    if($result != FALSE) 
    {
        $events = array();
        while($row = $result->fetch()) 
        {
            $events[] = $row;
        }
        echo json_encode($events);
    } 
    else
        die("Error in database query");
?>