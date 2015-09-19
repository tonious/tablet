Components={};

Components.mhs1104_csg = function() {
  var csg = new CSG();

  csg=csg.union(
    CSG.cube({
      radius: [8.5/2,3.5/2,3.5/2],
      center: [0,0,-3.5/2]
    }).setColor(0.7,0.7,0.7)
  );

  csg=csg.union(
    CSG.cube({
      radius: [4/2,2/2,0.1],
      center: [0,0,0]
    }).setColor(0.2,0.2,0.2)
  );

  csg=csg.union(
    CSG.cube({
      radius: [2/2,2/2,2/2],
      center: [2/2,0,2/2]
    }).setColor(0.2,0.2,0.2)
  );

  var clearance = new CSG();

  clearance=clearance.union(
    CSG.cube({
      radius: [4,2,2],
      center: [0,0,2/2]
    })
  );

  var i=0;
  var plane=null;
  for(i=0;i<90;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-2.5,-1.5,0]);
    clearance = clearance.cutByPlane(plane);
  }

  for(i=90;i<180;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+2.5,-1.5,0]);
    clearance = clearance.cutByPlane(plane);
  }

  for(i=180;i<270;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([+2.5,+1.5,0]);
    clearance = clearance.cutByPlane(plane);
  }

  for(i=270;i<360;i+=10){
    plane = CSG.Plane.fromNormalAndPoint([-1,0,-1], [0, 0, 0]).rotateZ(i).translate([-2.5,+1.5,0]);
    clearance = clearance.cutByPlane(plane);
  }

  clearance=clearance.union(
    CSG.cube({
      radius: [9/2,4/2,4/2],
      center: [0,0,-4/2]
    })
  );

  csg.properties.clearance = clearance;
  return(csg);
}

