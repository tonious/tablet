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
