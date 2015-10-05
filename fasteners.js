fasteners = function() {
};

fasteners.resolution = 12;
fasteners.head_clearance=0.5;

/*
 * Figures from:
 *   * http://www.rfcafe.com/references/general/bolts-nuts-washers-sae.htm
 *   * http://www.amesweb.info/Screws/AsmeUnifiedInchScrewThread.aspx
 *   * http://www.americanfastener.com/machine-screws/
 *   * http://www.americanfastener.com/nuts/
 *
 */
 
fasteners.table = {
  '#4-40': {
    'family':           'SAE',
    'series':           'UNC',
    'head_height':      0.120   * 25.4,
//    'head_height':      0.080   * 25.4,
    'head_radius':      0.219/2 * 25.4,
    'clearance_radius': 0.129/2 * 25.4,
    'major_radius':     0.112/2 * 24.5,
    'pitch_radius':     0.095/2 * 25.4,
    'tap_radius':       0.085/2 * 25.4,
    'minor_radius':     0.085/2 * 24.5,
    'socket':           1/16    * 25.4,
    'socket_type':      'robertson',
    'nut_flats':        0.250   * 25.4,
    'nut_thickness':    0.096   * 25.4,
    'washer_ir':        0.125/2 * 25.4,
    'washer_or':        0.375/2 * 25.4,
    'barbsert_radius':  2, // Determined experimentally.
    'barbsert_or':      0.173/2 * 25.4,
    'barbsert_length':  0.205   * 25.4
  },
  '#6-32': {
    'family':           'SAE',
    'series':           'UNC',
    'head_height':      0.097   * 25.4,
    'head_radius':      0.290/2 * 25.4,
    'clearance_radius': 0.150/2 * 25.4,
    'major_radius':     0.138/2 * 25.4,
    'pitch_radius':     0.118/2 * 25.4,
    'tap_radius':       0.104/2 * 25.4,
    'minor_radius':     0.104/2 * 25.4,
    'socket':           3/32    * 25.4,
    'socket_type':      'robertson',
    'nut_flats':        0.312   * 25.4,
    'nut_thickness':    0.114   * 25.4,
    'washer_ir':        0.156/2 * 25.4,
    'washer_or':        0.438/2 * 25.4,
    'barbsert_radius':  0.196/2 * 25.4,
    'barbsert_or':      0.217/2 * 25.4,
    'barbsert_length':  0.276   * 25.4
  },
  '1/4-20': {
    'family':           'SAE',
    'series':           'UNC',
    'head_height':      0.175   * 25.4,
    'head_radius':      0.492/2 * 25.4,
    'clearance_radius': 0.266/2 * 25.4,
    'major_radius':     0.250/2 * 25.4,
    'pitch_radius':     0.218/2 * 25.4,
    'tap_radius':       0.196/2 * 25.4,
    'minor_radius':     0.196/2 * 25.4,
    'socket':           3/16    * 25.4,
    'socket_type':      'robertson',
    'nut_flats':        0.438   * 25.4,
    'nut_thickness':    0.193   * 25.4,
    'washer_ir':        0.281/2 * 25.4,
    'washer_or':        0.734/2 * 25.4,
    'barbsert_radius':  0.320/2 * 25.4,
    'barbsert_or':      0.335/2 * 25.4,
    'barbsert_length':  0.500   * 25.4
  },
};

fasteners.panhead_csg = function(params) {
  var chamfer = params.head_height/2;
  var chamfer_radius2 = Math.cos(Math.PI/6)*chamfer;
  var chamfer_radius = Math.cos(2*Math.PI/6)*chamfer;

  var head_height = params.head_height;
  var head_radius = params.head_radius;
  var socket = params.socket;
  var resolution = 16;

  var csg = new CSG();

  csg = csg.union(CSG.cylinder({
    start: [0, 0, 0],
    end:   [0, 0, head_height-chamfer],
    radius: head_radius,
    resolution: this.resolution,
  }));

  csg = csg.union(CSG.cylinder({
    start: [0, 0, head_height-chamfer],
    end:   [0, 0, head_height-chamfer*2/3],
    radiusStart: head_radius,
    radiusEnd: head_radius - chamfer/2+chamfer_radius2/2,
    resolution: this.resolution,
  }));

  csg = csg.union(CSG.cylinder({
    start: [0, 0, head_height-chamfer*2/3],
    end:   [0, 0, head_height-chamfer*1/3],
    radiusStart: head_radius - chamfer/2+chamfer_radius2/2,
    radiusEnd: head_radius - chamfer/2+chamfer_radius/2,
    resolution: this.resolution,
  }));

  csg = csg.union(CSG.cylinder({
    start: [0, 0, head_height-chamfer*1/3],
    end:   [0, 0, head_height],
    radiusStart: head_radius - chamfer/2+chamfer_radius/2,
    radiusEnd: head_radius - chamfer/2,
    resolution: this.resolution,
  }));

  csg = csg.subtract(CSG.cube({
    center: [0,0,socket/2+head_height/2],
    radius: [socket/2,socket/2,socket/2]
  }));

  return(csg);
};

fasteners.machinescrew_csg = function(size,length) {

  var params = this.table[size];

  screw = new CSG();
  
  screw = screw.union(CSG.cylinder({
    start: [0, 0, 0.1],
    end:   [0, 0, -length],
    radius: params.pitch_radius,
    resolution: this.resolution,
  }));

  screw=screw.union(this.panhead_csg(params));

  screw.properties.clearance = CSG.cylinder({
    start: [0, 0, 0.1],
    end:   [0, 0, -length],
    radius: params.clearance_radius,
    resolution: this.resolution,
  });

  screw.properties.clearance = screw.properties.clearance.union( CSG.cylinder({
    start: [0, 0, 0],
    end:   [0, 0, params.head_height],
    radius: params.head_radius+this.head_clearance,
  }));


  screw = screw.setColor(0.9,0.9,0.9);
  screw.properties.params=params;
  return( screw ); 
};

fasteners.hexnut_csg = function(size) {

  var params = this.table[size];

  var nut = hex_csg(
    params.nut_flats,
    params.nut_thickness,
    0
  );

  nut = nut.subtract(CSG.cylinder({
    start: [0,0,-1],
    end: [0,0,params.nut_thickness+1],
    radius: params.major_radius,
    resolution: this.resolution,
  }));

  nut = nut.setColor(0.9,0.9,0.9);

  nut.properties.params=params;
  return(nut);
};

fasteners.barbsert_csg = function(size) {

  var params = this.table[size];

  var csg = CSG.cylinder({
    start: [0,0,0.1],
    end: [0,0,-params.barbsert_length],
    radius: params.barbsert_or,
    resolution: this.resolution,
  });

  csg = csg.subtract(CSG.cylinder({
    start: [0,0,1],
    end: [0,0,-params.barbsert_length-1],
    radius: params.major_radius,
    resolution: this.resolution,
  }));

  csg.properties.hole = CSG.cylinder({
    start: [0,0,0],
    end: [0,0,-params.barbsert_length],
    radius: params.barbsert_radius,
    resolution: this.resolution,
  });

  csg.properties.params=params;
  csg = csg.setColor(0.8,0.8,0.4);

  return(csg);
};

