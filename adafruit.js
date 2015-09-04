function battery_csg() {
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

  return(csg);
}
 

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

  for(var i=0;i<90;i+=10){
    var plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-displaywidth/2,-displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(var i=90;i<180;i+=10){
    var plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+displaywidth/2,-displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(var i=180;i<270;i+=10){
    var plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+displaywidth/2,+displayheight/2,0]);
    screencutout = screencutout.cutByPlane(plane);
  }

  for(var i=270;i<360;i+=10){
    var plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-displaywidth/2,+displayheight/2,0]);
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
