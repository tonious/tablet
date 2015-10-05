utils = {};

function hex_csg(across_flats,thickness) {
  var radius = (2*Math.sqrt(3)/3 * across_flats)/2;
  var points = [];
  for(i=0;i<Math.PI*2;i+=Math.PI/3){
    var x = Math.sin(i+Math.PI/6)*radius;
    var y = Math.cos(i+Math.PI/6)*radius; 
    points.push([x,y]);
  }
  var hex = new CSG.Path2D(points);
  hex = hex.close();
  hex = hex.innerToCAG();
  hex = hex.extrude({offset:[0,0,thickness]});

  return(hex);
}

function center(obj) {
  return( obj.translate([
    -(obj.getBounds()[1].x + obj.getBounds()[0].x)/2,
    -(obj.getBounds()[1].y + obj.getBounds()[0].y)/2,
    -(obj.getBounds()[1].z + obj.getBounds()[0].z)/2,
  ]));
}

function assemble(objs) {
  return(objs.reduce(function(previousValue, currentValue, index, array){
    return(previousValue.union(currentValue));
  }));
}

function stack(objs) {
  var spacing = 20; // mm.
  return(objs.reduce(function(previousValue, currentValue, index, array){
        var z = previousValue.getBounds()[1].z - currentValue.getBounds()[0].z + spacing;
    return(previousValue.union(currentValue.translate([0,0,z])));
  }));
}

utils.holddown_csg = function() {
  var height=2.4+2;
  var width=3;
  var thickness=1.5;
  var overhang=0.2;
  var bevel=0.5;
  var topthick=1.4;

  var cag = CAG.fromPoints([
    [0,0],
    [0,height-bevel],
    [bevel,height],
    [bevel+overhang,height],
    [bevel+overhang-thickness,height+topthick],
    [-thickness,height+topthick],
    [-thickness,0]
  ]);

  var csg=cag.extrude({offset: [0,0,width]});
  csg=csg.translate([0,0,-width/2]);
  csg=csg.rotateX(90);

  cag=CAG.roundedRectangle({
    center: [-thickness/2,0],
    radius: [(thickness+2)/2, (width+2)/2],
    roundradius: 2 
  });

  csg.properties.clearance=cag.extrude({offset:[0,0,height]});

  return(csg);
};

utils.peg_csg = function(radius,height,pcbthickness) {
  var csg = new CSG();

  csg = csg.union(CSG.cylinder({
    start: [0,0,0],
    end: [0,0,-height],
    radius: radius+1,
  }));
  csg = csg.union(CSG.cylinder({
    start: [0,0,0],
    end: [0,0,pcbthickness],
    radius: radius,
  }));

  return(csg);
};
