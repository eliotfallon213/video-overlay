<?php

class FaceCrop
{

    private $src_img;
    private $src_w;
    private $src_h;
    private $dst_img;
    private $dst_w;
    private $dst_h;

    public function __construct($img, $offsetX, $offsetY, $rad1, $rad2, $scale, $rotate)
    {
        $this->src_img = $img;
        $this->src_w = imagesx($img);
        $this->src_h = imagesy($img);
        $this->dst_w = $rad1*2;
        $this->dst_h = ($rad1*2) + $rad2;
        $this->rad1 = $rad1;
        $this->rad2 = $rad2;
        $this->offset_x = $offsetX;
        $this->offset_y = $offsetY;
        $this->scale = $scale;
        $this->rotate = $rotate;
    }

    public function __destruct()
    {
        if (is_resource($this->dst_img))
        {
            imagedestroy($this->dst_img);
        }
    }

    public function display()
    {
        header("Content-type: image/png");
        imagepng($this->dst_img);
        return $this;
    }
    
    public function save($fileName)
    {
        //imagepng ( resource $image [, string $filename [, int $quality [, int $filters ]]] )
        imagepng($this->dst_img, $fileName, 5);
        
        return $this;
    }

    public function reset()
    {
        if (is_resource(($this->dst_img)))
        {
            imagedestroy($this->dst_img);
        }
        $this->dst_img = imagecreatetruecolor($this->dst_w, $this->dst_h);
        
        //Rotates src image and re-crops around centre
        $rotImage =  imagerotate($this->src_img, ($this->rotate * -1), 0);
        $rotHeight = imagesy($rotImage);
        $rotWidth = imagesx($rotImage);
        imagecopy($this->src_img, $rotImage, 0, 0, ($rotWidth-$this->src_w)/2, ($rotHeight-$this->src_h)/2, $this->src_w, $this->src_h);
        
        //Crops, offsets and scales       
        $srcWidth = ($this->rad1*2)/ $this->scale;
        $srcHeight = (($this->rad1*2) + $this->rad2)/ $this->scale;
        
        //Place srcWidth and height about centre
        $srcOffX = ($this->src_w/2) - ($srcWidth/2);
        $srcOffY = ($this->src_h/2) - ($srcHeight/2);

        imagecopyresampled($this->dst_img, $this->src_img, 0, 0, $srcOffX-($this->offset_x/$this->scale), $srcOffY-($this->offset_y/$this->scale), $this->dst_w, $this->dst_h, $srcWidth, $srcHeight);

        return $this;
    }

    public function size($dstWidth, $dstHeight)
    {
        $this->dst_w = $dstWidth;
        $this->dst_h = $dstHeight;
        return $this->reset();
    }
    
    public function faceCrop()
    {
        // Intializes destination image
        $this->reset();

        // Create a black image with a transparent ellipse, and merge with destination
        $mask = imagecreatetruecolor($this->dst_w, $this->dst_h);
        $maskTransparent = imagecolorallocate($mask, 255, 0, 255);
        imagecolortransparent($mask, $maskTransparent);
        
        //Add shape
        $r1 = $this->rad1;
        $r2 = $this->rad2;
        $d1 = $r1;
        $c1 = array($this->rad1, $this->rad1);
        $c2 = array($c1[0], $c1[1] + $d1);

        imagefilledellipse($mask, $c1[0], $c1[1], $r1*2, $r1*2, $maskTransparent);
        imagefilledellipse($mask, $c2[0], $c2[1], $r2*2, $r2*2, $maskTransparent);
        $tau = pi()/2 - asin(($r1-$r2)/$d1);
        //echo $tau;
        $deltaX1 = intval($r1 * sin($tau));
        $deltaY1 = intval($r1 * cos($tau));
        $deltaX2 = intval($r2 * sin($tau));
        $deltaY2 = intval($r2 * cos($tau));
        $values = array(
            $c1[0]-$deltaX1,  $c1[1]+$deltaY1,  // Point 1 (x, y)
            $c2[0]-$deltaX2,  $c2[1]+$deltaY2, // Point 2 (x, y)
            $c2[0]+$deltaX2,  $c2[1]+$deltaY2,  // Point 3 (x, y)
            $c1[0]+$deltaX1,  $c1[1]+$deltaY1 // Point 4 (x, y)
        );

        imagefilledpolygon($mask, $values, 4, $maskTransparent);
        //
        
        imagecopymerge($this->dst_img, $mask, 0, 0, 0, 0, $this->dst_w, $this->dst_h, 100);
                
        // Fill each corners of destination image with transparency
        $dstTransparent = imagecolorallocate($this->dst_img, 255, 0, 255);
        imagefill($this->dst_img, 0, 0, $dstTransparent);
        imagefill($this->dst_img, $this->dst_w - 1, 0, $dstTransparent);
        imagefill($this->dst_img, 0, $this->dst_h - 1, $dstTransparent);
        imagefill($this->dst_img, $this->dst_w - 1, $this->dst_h - 1, $dstTransparent);
        imagecolortransparent($this->dst_img, $dstTransparent);

        return $this;
    }

}

?>