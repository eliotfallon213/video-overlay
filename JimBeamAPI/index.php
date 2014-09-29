<?php
require 'flight/Flight.php';
require 'db/db.php';
require 'facebook-sdk/facebook.php';

function FacebookIDMatch($FBID) {
    if (!isset($facebook)) {
//        $facebook = new Facebook(array(
//            'appId'  => '175338975986059',
//            'secret' => 'dad17024098becb92170948204e2943c',
//        ));
        
        $facebook = new Facebook(array(
            'appId'  => '634914019873215',
            'secret' => 'aff61ffa401098526a05f324157795b3',
        ));
    }

    if($FBID==$facebook->getUser()) {
        return TRUE;
    } else {
        return FALSE;
    }
}

Flight::route('/', function() {
            echo 'Jim Beam Lime Splash Video API';
        });

Flight::route('POST /head/@FBID', function($FBID) {
    
            if(!FacebookIDMatch($FBID)) throw new Exception('Facebook ID Error');
    
            $value = json_decode(file_get_contents('php://input'));
            
            require_once 'imageTransform/imageTransform.php';
            
            $offset = array("X" => $value->offsetX, "Y" => $value->offsetY);
            $scale = $value->scale;
            $rotate = $value->rotate;

            //Detect different file types
            //$img = imagecreatefrompng($value->imageURL);
            $temp_image = file_get_contents($value->imageURL);
            $img = imagecreatefromstring($temp_image);
            
            //DB Operations to log image and image name return ImageName
            $db = new dbOps();
            $imgName["imageFile"] = $db->addImageRecord($FBID);
            //
            
            $crop = new FaceCrop($img, $offset["X"], $offset["Y"], 70, 60, $scale, $rotate);
            $crop->faceCrop()->save("createdImages/".$imgName["imageFile"]);
            
            $response[]=$imgName;
            echo json_encode($response);
            
        });
        
Flight::route('GET /head/@FBID', function($FBID) {
    
        if(!FacebookIDMatch($FBID)) throw new Exception('Facebook ID Error');

        //DB Operations to log image and image name return ImageName
        $db = new dbOps();
        $imgs["heads"] = $db->getAllImages($FBID);
        //
        
        echo json_encode($imgs);
        
});
        
Flight::route('POST /video/@FBID', function($FBID) {
    
        if(!FacebookIDMatch($FBID)) throw new Exception('Facebook ID Error');
        
        //NEEDS LOTS OF VALIDATION AS IT IS A MEMORY INTENSIVE OPERATION    
    
        //CREATE VIDEO CALL VIDEO OPERATIONS
        $value = json_decode(file_get_contents('php://input'));
        
        require_once 'videoTransform/videoTransform.php';
        
        //DB Operations to log image and image name return ImageName
        $db = new dbOps();
        $vidName = $db->addVideoRecord($FBID);
        //
        
        $newVideo = new videoCompile($vidName["videoDir"], $value->selectedHeads, $value->selectedVideo);
        session_write_close();
        $newVideo->overlayHeads()->outputVideo();
        
        $response[]=$vidName;
        echo json_encode($response);
            
});
        
Flight::route('GET /video', function() {

        echo file_get_contents('stockVideos/specs.json');
});

Flight::route('GET /image/size', function() {
            //CREATE VIDEO CALL VIDEO OPERATIONS
           $value = json_decode(file_get_contents('php://input'));
           
            $temp_image = file_get_contents($_GET["imageURL"]);
            $img = imagecreatefromstring($temp_image);
            $iamgesizes["X"] =imagesx($img);
            $iamgesizes["Y"] =imagesy($img);
            
            $response[]=$iamgesizes;
            echo json_encode($response);
            
});

Flight::route('GET /user/@FBID', function($FBID) {
    
        if(!FacebookIDMatch($FBID)) throw new Exception('Facebook ID Error');

        //DB Operations to log image and image name return ImageName
        $db = new dbOps();
        $user["userExists"] = $db->userExist($FBID);
        //
        
        echo json_encode($user);
});

Flight::route('POST /user/@FBID', function($FBID) {
        
        if(!FacebookIDMatch($FBID)) throw new Exception('Facebook ID Error');
    
        $value = json_decode(file_get_contents('php://input'));
        //DB Operations to log image and image name return ImageName
        $db = new dbOps();
        if(!$db->userExist($FBID)) {
            $user = $db->addUser($FBID, $value->user->name, $value->user->email);
            echo json_encode($user);
        }
        // 
});

Flight::route('GET /share/@shareID', function($shareID) {

        //DB Operations to log image and image name return ImageName
        $db = new dbOps();
        $user = $db->getSharedVideo($shareID);
        //
        
        echo json_encode($user);
});
        
Flight::start();
?>
