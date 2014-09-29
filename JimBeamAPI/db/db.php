<?php

class dbOps
{
    private $DbName;
    private $DbUname;
    private $DbPassword;
    private $con;
    
    public function __construct()
    {
//        $this->DbName = "jimbeam";
//        $this->DbUname = "eliot";
//        $this->DbPassword = "P455word";
        $this->DbName = "admin_jimbeam";
        $this->DbUname = "admin_mysql";
        $this->DbPassword = "123456";
        
        // Create connection
        $this->con=mysqli_connect("localhost", $this->DbUname, $this->DbPassword, $this->DbName);

        // Check connection
        if (mysqli_connect_errno($this->con)){
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
        }     
    }
    
    public function addUser()
    {
        
    }
    
    public function addImageRecord($userID)
    {
        $cleanID = mysqli_real_escape_string($this->con, $userID);
        
        //INSERT INTO IMAGE RECORD TABLE
        mysqli_query($this->con, "INSERT INTO `jimbeam`.`imageRecords` (`ImageID`, `TimeAdded`, `UserID`) VALUES (NULL, CURRENT_TIMESTAMP, '".$cleanID."')");
        
        //SELECT FILENAME MOST RECENT IMAGE WITH USERS ID NUMBER AND RETURN IT
        $recentImage = mysqli_query($this->con, "SELECT * FROM `imageRecords` WHERE `UserID` = '".$cleanID."' ORDER BY `TimeAdded` DESC LIMIT 1");

        while ($row = mysqli_fetch_array($recentImage)) {
            $fileName = $row[2]."-".$row[0].".png";
        }
        
        return $fileName;
    }
    
    public function addVideoRecord($userID)
    {
        $cleanID = mysqli_real_escape_string($this->con, $userID);
        
        //INSERT INTO IMAGE RECORD TABLE
        mysqli_query($this->con, "INSERT INTO `jimbeam`.`videoRecords` (`VideoID`, `TimeAdded`, `UserID`) VALUES (NULL, CURRENT_TIMESTAMP, '".$cleanID."')");
        
        //SELECT FILENAME MOST RECENT IMAGE WITH USERS ID NUMBER AND RETURN IT
        $recentImage = mysqli_query($this->con, "SELECT * FROM `videoRecords` WHERE `UserID` = '".$cleanID."' ORDER BY `TimeAdded` DESC LIMIT 1");

        while ($row = mysqli_fetch_array($recentImage)) {
            $dirName = $row[2]."-".$row[0];
        }
        
        return $dirName;
    }

    
}
?>
