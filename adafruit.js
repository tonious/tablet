Adafruit = {};

Adafruit.powerboost1000c_csg = function() {
  /* Dimensions from https://learn.adafruit.com/adafruit-powerboost-1000c-load-share-usb-charge-boost/downloads
   */

  var thickness=1.8;
  var width=36.2;
  var height=22.86;
  
  cag = new CAG();

  cag = cag.union(
    CAG.roundedRectangle({
      corner1: [0,0],
      corner2: [width,height],
      roundradius: 2.5
    })
  );

  // Mounting holes.
  cag = cag.subtract(
    CAG.circle({
      center: [2.5,height/2-17.65/2],
      radius: 2.5/2
    })
  );
  cag = cag.subtract(
    CAG.circle({
      center: [2.5,height/2+17.65/2],
      radius: 2.5/2
    })
  );

  // USB holes.
  cag = cag.subtract(
    CAG.circle({
      center: [width-2.5,height/2-13.5/2],
      radius: 2.0/2
    })
  );
  cag = cag.subtract(
    CAG.circle({
      center: [width-2.5,height/2+13.5/2],
      radius: 2.0/2
    })
  );

  csg = cag.extrude({offset:[0,0,thickness]});
  csg = csg.setColor(0.5,0.5,1.0);

  // JST 
  csg = csg.union(CSG.cube({
    center: [10.67, height-5/2, 6/2+thickness],
    radius: [7.5/2, 5/2, 6/2]
  }).setColor(0.5,0.5,0.5));

  // MicroUSB
  csg = csg.union(CSG.cube({
    center: [5.6/2-0.5, height/2, 2.4/2+thickness],
    radius: [5.6/2, 7.6/2, 2.4/2]
  }).setColor(0.8,0.8,0.8));

  // Clearance for microusb.
  var usbboot = CAG.roundedRectangle({radius: [13/2, 9/2], roundradius:2});

  usbboot = usbboot.extrude({offset:[0,0,20]});
  usbboot = usbboot.rotateX(90).rotateZ(-90);
  usbboot = usbboot.translate([-2.5,height/2,2.4/2+1.6]);

  var usbmini = CAG.roundedRectangle({radius: [7/2, 2.6/2], roundradius:1});

  usbmini = usbmini.extrude({offset:[0,0,20]});
  usbmini = usbmini.rotateX(90).rotateZ(-90);
  usbmini = usbmini.translate([3,height/2,2.4/2+1.6]);

  var clearance=usbmini.union(usbboot);

  var pegs=new CSG();
  [ utils.peg_csg(2.3/2,3,1.8).translate([2.5,height/2-17.65/2,0]),
    utils.peg_csg(2.3/2,3,1.8).translate([2.5,height/2+17.65/2,0]),
    utils.peg_csg(2.0/2,3,1.8).translate([width-2.2,height/2-13/2,0]),
    utils.peg_csg(2.0/2,3,1.8).translate([width-2.2,height/2+13/2,0])
  ].forEach(function(peg){
    pegs=pegs.union(peg);
  });
  csg.properties.pegs=pegs;

  var clips=new CSG();

  [ utils.holddown_csg().rotateZ(90).translate([2.5,0,-2.4]),
    utils.holddown_csg().rotateZ(90).translate([width-2.5,0,-2.4]),
    utils.holddown_csg().rotateZ(-90).translate([2.5,height,-2.4]),
    utils.holddown_csg().rotateZ(-90).translate([width-2.5,height,-2.4])
  ].forEach(function(clip){
    clips=clips.union(clip);
    clearance=clearance.union(clip.properties.clearance);
  });

  csg.properties.clips=clips;

  csg.properties.clearance=clearance;

  return(csg);
};

Adafruit.lipo6600_csg = function() {
  /*
   * Adafruit 6600mAh battery:
   *   * 18 (.3) mm thick
   *   * 55 (.5) mm wide
   *   * 66 mm long
   */
  
  var thickness=18.0;
  var width=55.0;
  var length=66.0;

  csg = new CSG();

  csg=csg.union(CSG.cylinder({
    start: [0,length/2,0],
    end: [0,-length/2,0],
    radius: thickness/2,
    resolution: 24
  }));

  csg=csg.union(CSG.cylinder({
    start: [width/2-thickness/2,length/2,0],
    end: [width/2-thickness/2,-length/2,0],
    radius: thickness/2,
    resolution: 24
  }));

  csg=csg.union(CSG.cylinder({
    start: [-width/2+thickness/2,length/2,0],
    end: [-width/2+thickness/2,-length/2,0],
    radius: thickness/2,
    resolution: 24
  }));

  csg=csg.union(CSG.cube({
    corner1: [-thickness,length/2-1,thickness/2],
    corner2: [thickness,-length/2+1,-thickness/2],
  }));

  csg=csg.setColor(0,0,0.8);


  var ribthick=3;
  var offset=3;

  var rib=CSG.cube({
    corner1: [-width/2-ribthick, -ribthick/2, -thickness/2-offset ],
    corner2: [+width/2+ribthick, +ribthick/2,  ribthick ]
  });

  var cag=CAG.roundedRectangle({
    center: [0,0],
    radius: [width/2,thickness],
    roundradius: thickness/2
  });

  rib = rib.subtract(cag.extrude({offset:[0,0,ribthick*2]}).rotateX(90).translate([0,ribthick,thickness/2]));

  var loopwidth=5;
  var loopthick=1;

  var loopclearance=cag.extrude({offset:[0,0,loopwidth]}).rotateX(90).translate([0,loopwidth/2,thickness/2-offset]);

  var loop=CSG.cube({ 
    corner1: [-ribthick/2,-loopwidth/2-ribthick,-thickness/2],
    corner2: [+ribthick/2,+loopwidth/2+ribthick,-thickness/2-ribthick]
  });

  loop=loop.subtract(CSG.cube({ 
    corner1: [-ribthick/2,-loopwidth/2,-thickness/2-loopthick],
    corner2: [+ribthick/2,+loopwidth/2,-thickness/2-ribthick] 
  }));
  bracket = new CSG();

  bracket=bracket.union(loop.translate([thickness,0,0]));
  bracket=bracket.union(loop.translate([-thickness,0,0]));
  bracket=bracket.union(rib.translate([0,length*1/3,0]));
  bracket=bracket.union(rib.translate([0,length*-1/3,0]));

  csg.properties.bracket=bracket;
  csg.properties.clearance=loopclearance;

  return(csg);
};

function screen_csg() {
  /*
   * Adafruit 7" display.
   *
   */

  // Physical extents of the display.
  // Plus a little bit of extra space.
  //var width=164;
  //var height=100;
  var width=165.4;
  var height=100.4;
  var thickness=5;

  // Functional display area..
  var displaywidth=154.08;
  var displayheight=85.92;

  // Where is that functional display area relative to the physical extents?
  //var displaycenterx=80.96;
  //var displaycentery=47.74; 
  var centerx=80.96+0.7;
  var centery=47.74+0.2;

  csg = new CSG();

  csg = csg.union(CSG.cube({
    center: [-width/2+centerx, height/2-centery, -thickness/2],
    radius: [width/2, height/2, thickness/2]
  }).setColor(0.8,0.8,0.8));

  csg = csg.union(CSG.cube({
    center: [0, 0, 0],
    radius: [displaywidth/2, displayheight/2, 1]
  }).setColor(0.2,0.2,0.2));

  // Cutout.

  var screencutout = new CSG();

  screencutout = screencutout.union(CSG.cube({
    radius: [displaywidth/2+thickness, displayheight/2+thickness, thickness*2]
  }));

  var i=0;
  var plane=null;
  for(i=0;i<90;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-displaywidth/2,-displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(i=90;i<180;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+displaywidth/2,-displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(i=180;i<270;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+displaywidth/2,+displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(i=270;i<360;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-displaywidth/2,+displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  screencutout=screencutout.union(CSG.cube({
    center: [-width/2+centerx,  height/2-centery, -thickness/2],
    radius: [width/2, height/2, thickness/2]
  }));

  screencutout=screencutout.union(CSG.cube({
    center: [0,  height-centery, -thickness/2],
    radius: [20, 1, thickness/2]
  }));

  csg.properties.cutout=screencutout;
  csg.properties.width=width;
  csg.properties.height=height;
  csg.properties.thickness=thickness;

  // Expose the center of our enclosure.
  csg.properties.center = new CSG.Connector(
    [-width/2+centerx, height/2-centery, 0],
    [0, 0, 1],
    [1, 0, 0]
  );

  return(csg);
}
