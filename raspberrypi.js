function RaspberryPi() {

}

RaspberryPi.resolution=12;
RaspberryPi.modelbplus_drill=2.75;
RaspberryPi.modelbplus_holes=[
  [3.5,3.5],
  [61.5,3.5],
  [3.5,52.5],
  [61.5,52.5],
];

RaspberryPi.picam_holes=[
  [2,9.5],
  [23,9.5],
  [2,22],
  [23,22],
];

RaspberryPi.picambosses_csg = function() {
  this.picam_holes.forEach(function(position){
    cag = cag.union(CAG.circle({
      center: position,
      radius: 6/2,
      resolution: this.resolution 
    }));

    cag = cag.subtract(CAG.circle({
      center: position,
      radius: drill,
      resolution: this.resolution 
    }));
  });

  var csg = cag.extrude({
    offset: [0, 0, 20],
  });

  return(csg);
};

RaspberryPi.picam_csg = function() {
  /*
   * Dimensions from:
   * 
   * http://www.scribd.com/doc/142718448/Raspberry-Pi-Camera-Mechanical-Data
   * https://www.adafruit.com/blog/2013/05/24/64677/
   * http://www.raspberrypi-spy.co.uk/2013/05/pi-camera-module-mechanical-dimensions/
   * 
   */

  var drill = 1.8/2;

  var csg = new CSG();

  var cag = CAG.rectangle({
    corner1: [0, 0],
    corner2: [25, 24]
  }); 

  this.picam_holes.forEach(function(position){
    cag = cag.subtract(CAG.circle({
      center: position,
      radius: 2.0/2,
      resolution: this.resolution
    }));
  });

  // Extrude PCB
  csg = csg.union(cag.extrude({
    offset: [0, 0, 1],
  }).setColor(0,0.5,0));

  // Connectors
  csg = csg.union(CSG.cube({
    corner1: [8.5,13.5,1],
    corner2: [16.5,22,2],
  }).setColor(0.5,0.5,0.0));

  csg = csg.union(CSG.cube({
    corner1: [8.5,5.5,1],
    corner2: [16.5,13.5,4],
  }).setColor(0.3,0.3,0.3));

  // Camera
  csg = csg.union(CSG.cylinder({
    start: [12.5,9.5,4],
    end: [12.5,9.5,6.5],
    radius: 4,
    resolution: this.resolution
  }).setColor(0.3,0.3,0.3));

  csg = csg.subtract(CSG.cylinder({
    start: [12.5,9.5,5],
    end: [12.5,9.5,6.5],
    radius: 2,
    resolution: this.resolution
  }).setColor(0.3,0.3,0.3));


  csg.properties.bosses = this.picambosses_csg().translate([0,0,1]);
  // Camera cutout.

  csg.properties.camera_clearance = CSG.cylinder({
    start: [12.5,9.5,4],
    end: [12.5,9.5,25],
    radius: 5,
    resolution: this.resolution
  });

  return( csg );
};

RaspberryPi.modelbplusbosses_csg = function(thickness) {
  var csg = new CSG();
  var cag = new CAG();

  this.modelbplus_holes.forEach(function(position){
    cag = cag.union(CAG.circle({
      center: position,
      radius: 8/2,
      resolution: 8
    }));

    cag = cag.subtract(CAG.circle({
      center: position,
      radius: 2.5/2,
      resolution: 8
    }));
  });


  csg=cag.extrude({
    offset: [0, 0, -thickness],
  });

  return(csg);
};

RaspberryPi.modelbplus_csg = function() {
  /*
   * Dimensions from:
   *
   * http://docs-europe.electrocomponents.com/webdocs/12fa/0900766b812faa0e.pdf
   * http://boardswithwires.blogspot.ca/2013/03/diy-case-for-raspberry-pi.html
   * http://www.raspberrypi.org/forums/viewtopic.php?f=2&t=4402
   *
   */

  var drill = 2.5/2;

  var csg = new CSG();

  // PCB
  var cag = CAG.roundedRectangle({
    corner1: [0, 0],
    corner2: [85, 56],
    roundradius: 3
  }); 

  this.modelbplus_holes.forEach(function(position){
    cag = cag.subtract(CAG.circle({
      center: position,
      radius: 2.75/2,
      resolution: 8
    }));
  });

  csg = csg.union(cag.extrude({
    offset: [0, 0, 1.6],
  }).setColor(0,0.5,0));

  // Ethernet
  csg = csg.union(CSG.cube({
    center: [85+2-21.8/2, 10.25, 13.5/2+1.6],
    radius: [21.8/2+2, 16.5/2, 13.5/2]
  }).setColor(0.8,0.8,0.8));

  // USB 
  csg = csg.union(CSG.cube({
    center: [85+2-17.2/2, 29, 16/2+1.6],
    radius: [17.2/2+2, 15.5/2, 16/2]
  }).setColor(0.8,0.8,0.8));

  csg = csg.union(CSG.cube({
    center: [85+2-17.2/2, 47, 16/2+1.6],
    radius: [17.2/2+2, 15.5/2, 16/2]
  }).setColor(0.8,0.8,0.8));

  // MicroUSB (power)
  csg = csg.union(CSG.cube({
    center: [10.6, 5.6/2-1, 2.4/2+1.6],
    radius: [7.6/2, 5.6/2, 2.4/2]
  }).setColor(0.8,0.8,0.8));

  // Clearance for microusb.
  var usbmini = CAG.roundedRectangle({radius: [13/2, 10/2], roundradius:2});

  usbmini = usbmini.extrude({offset:[0,0,20]});
  usbmini = usbmini.rotateX(90);
  usbmini = usbmini.translate([10.6,0,2.4/2+1.6]);

  csg.properties.miniusb_clearance = usbmini;

  // HDMI
  csg = csg.union(CSG.cube({
    center: [32, 11.4/2-1, 6.16/2+1.6],
    radius: [15.1/2, 11.4/2, 6.15/2]
  }).setColor(0.8,0.8,0.8));

  csg.properties.bosses = this.modelbplusbosses_csg(5);

  return( csg );
};
