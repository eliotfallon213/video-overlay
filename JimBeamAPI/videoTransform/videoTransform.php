<?php

class videoCompile {

    private $vid_name;
    private $vid_sel;
    private $head_sel;

    public function __construct($vidName, $selectedHeads, $selectedVideo) {

        $this->vid_name = $vidName;
        $this->vid_sel = $selectedVideo;
        $this->head_sel = $selectedHeads;

        if (!is_dir("createdVideos/" . $vidName))
            mkdir("createdVideos/" . $vidName);
        if (!is_dir("createdVideos/" . $vidName . "/heads"))
            mkdir("createdVideos/" . $vidName . "/heads");
        if (!is_dir("createdVideos/" . $vidName . "/frames"))
            mkdir("createdVideos/" . $vidName . "/frames");

        //Copy in required heads
        copy('createdImages/' . $selectedHeads[0], "createdVideos/" . $vidName . "/heads/" . $selectedHeads[0]);
    }

    public function __destruct() {
        
    }
    
    private function csv_to_array($filename = '', $delimiter = ',') {
        if (!file_exists($filename) || !is_readable($filename))
            return FALSE;

        $header = NULL;
        $data = array();
        if (($handle = fopen($filename, 'r')) !== FALSE) {
            while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
                if (!$header)
                    $header = $row;
                else
                    $data[] = array_combine($header, $row);
            }
            fclose($handle);
        }
        return $data;
    }

    public function overlayHeads() {

        $string = file_get_contents("stockVideos/" . $this->vid_sel . "/spec.json");
        $vid_spec = json_decode($string, true);

        $rotation = $this->csv_to_array("stockVideos/" . $this->vid_sel . "/rotation.txt", "\t");
        $position = $this->csv_to_array("stockVideos/" . $this->vid_sel . "/position.txt", "\t");
        $scale = $this->csv_to_array("stockVideos/" . $this->vid_sel . "/scale.txt", "\t");

        //$head = imagecreatefrompng('createdImages/' . $this->head_sel[0]);
        $parentDir = dirname(dirname(__FILE__));
        $headFile = $parentDir . '/createdImages/' . $this->head_sel[0];

        $imgID = 1;

        while ($imgID <= $vid_spec["frames"]) {

            $frameNumber = ($imgID < 10) ? "0" . $imgID : $imgID;
            $zeroes = ($imgID < 100) ? "00000" : "0000";
            $stockFrameFile = $parentDir . "/stockVideos/" . $this->vid_sel . "/frames/image-" . $zeroes . $frameNumber . ".png";
            $vidFrameFile = $parentDir . "/createdVideos/" . $this->vid_name . "/frames/image-" . $zeroes . $frameNumber . ".png";
            
            //$stockFrame = imagecreatefrompng("stockVideos/".$this->vid_sel."/frames/image-00000".$frameNumber.".png");
            //imagecopymerge($stockFrame, $head, $imgID, 100, 0, 0, 140, 205, 100);
            //imagepng($stockFrame, $vidFrameFile, 9);
            
            if($position[$imgID]["x"]=="XX") {
                exec("cp ".$stockFrameFile." ".$vidFrameFile);
            } else {
                $setRotation = $rotation[$imgID]["rotation"] + $vid_spec["angleOffset"];
                if($scale && count($scale>0)) {
                    $setPositionX = $position[$imgID]["x"] - ($vid_spec["xOffset"] * ($scale[$imgID]["x"]/100));
                    $setPositionY = $position[$imgID]["y"] - ($vid_spec["yOffset"] * ($scale[$imgID]["y"]/100));
                    $sizeX = 140 * ($scale[$imgID]["x"]/100);
                    $sizeY = 200 * ($scale[$imgID]["x"]/100);
                    
                    exec("/usr/local/bin/composite -background 'rgba(0,0,0,0)' -resize ".$sizeX."x".$sizeY." -geometry +".$setPositionX."+".$setPositionY." \( " . $headFile . " -rotate " . $setRotation . " \) " . $stockFrameFile . " " . $vidFrameFile);
                } else {
                    $setPositionX = $position[$imgID]["x"] - $vid_spec["xOffset"];
                    $setPositionY = $position[$imgID]["y"] - $vid_spec["yOffset"];
                    
                    exec("/usr/local/bin/composite -background 'rgba(0,0,0,0)' -geometry +".$setPositionX."+".$setPositionY." \( " . $headFile . " -rotate " . $setRotation . " \) " . $stockFrameFile . " " . $vidFrameFile); 
                }
            }
            $imgID++;
        }

        //
        return $this;
    }

    public function outputVideo() {
        //But frames back together and SAVE OFF VIDEO
        $start = microtime(true);
        exec('/usr/local/bin/ffmpeg -f image2 -i createdVideos/' . $this->vid_name . '/frames/image-%07d.png -i stockVideos/' . $this->vid_sel . '/audio.mp3 -vcodec libx264 -pix_fmt yuv420p -r 25  -b 1000k createdVideos/' . $this->vid_name . '/out.mp4 2>&1 &', $error);

        $end = microtime(true);
        $time_taken = $end - $start;

//        echo PHP_EOL . 'Process Time: ' . $time_taken . ' seconds' . PHP_EOL . PHP_EOL;
    //
    }

}

?>