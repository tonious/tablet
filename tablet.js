function Tablet() {
  this.display = null;
  this.battery = null;
  this.pi = null;
  this.charger = null;
  this.sw = null;

  // Outside exterior dimensions.
  this.width=180;
  this.height=130;
  this.thickness=2; // Wall thickness.
  this.caserad=8; // Corner curve radius.

  this.topdepth=7;
  this.bottomdepth=22;
  this.middledepth=3;

  this.middlethickness=5;
  this.middleshrink=0.75;
  this.caselipheight=0.4;
  this.caselipthickness=0.5;

  this.bezel=1; // Thickness of top case over display frame.

  // Our corner cutout for connectors.
  this.cutoutwidth=62;
  this.cutoutheight=66;
  this.cutoutdepth=this.bottomdepth-this.thickness;
  this.cutoutrad=4;

  // Where are the case screws?
  this.screwsize="#4-40";
  this.screwlength=25.4;
  this.screwxinset=this.caserad;
  this.screwyinset=this.caserad;
  this.screws = [
    [ -this.width/2+this.screwxinset, -this.height/2+this.screwyinset, 0 ],
//    [  0,                             -this.height/2+this.screwyinset, 0 ], 
    [ -this.width/2+this.screwxinset,  this.height/2-this.screwyinset, 0 ],
//    [ -this.width/2+this.screwxinset, -this.height/2+this.screwyinset+this.cutoutheight, 0 ],
    [  this.width/2-this.screwxinset,  this.height/2-this.screwyinset, 0 ],
    [  this.width/2-this.screwxinset, -this.height/2+this.screwyinset, 0 ]
  ];

  this.bossthickness=this.thickness*0.8;

}

Tablet.prototype.topcase_csg = function() {

  csg = new CSG();

  var cag = CAG.roundedRectangle({
    corner1: [-this.width/2, -this.height/2],
    corner2: [ this.width/2,  this.height/2],
    roundradius: this.caserad
  }); 

  csg=csg.union(cag.extrude({
    offset: [0, 0, -this.topdepth-this.caselipheight],
  }).translate([0,0,1])); 

  cag = CAG.roundedRectangle({
    corner1: [-this.width/2+this.thickness, -this.height/2+this.thickness],
    corner2: [ this.width/2-this.thickness,  this.height/2-this.thickness],
    roundradius: this.caserad-this.thickness
  }); 
/*
  csg=csg.subtract(cag.extrude({
    offset: [0, 0, -this.topdepth],
  }).translate([0,0,-this.thickness+this.bezel]));
 */
  csg=csg.subtract(cag.extrude({
    offset: [0, 0, -this.topdepth],
  }).translate([0,0,-this.display.properties.thickness]));

  // Case lip.
  cag = CAG.roundedRectangle({
    corner1: [-this.width/2+this.caselipthickness, -this.height/2+this.caselipthickness],
    corner2: [ this.width/2-this.caselipthickness,  this.height/2-this.caselipthickness],
    roundradius: this.caserad-this.caselipthickness
  }); 

  csg=csg.subtract(cag.extrude({
    offset: [0, 0, -this.caselipheight],
  }).translate([0,0,-this.topdepth+this.bezel]));

 
  // We have to build up the inside of the case to support the display.
  build = new CSG();

  // Ridge around display.
  build=build.union(CSG.cube({
    center: [0,0, -this.display.properties.thickness/2],
    radius: [this.display.properties.width/2+this.thickness, this.display.properties.height/2+this.thickness, this.display.properties.thickness/2]
  }));

  // Corner tabs.
  var cornersize=15;
  var cornerthickness=1;

  var cx= this.display.properties.width/2+this.thickness;
  var cy=-this.display.properties.height/2-this.thickness;

  var corner=new CSG.Polygon2D([
    [cx,cy],
    [cx-cornersize,cy],
    [cx,cy+cornersize]
  ]).extrude({
    offset: [0, 0, cornerthickness+1]
  }).translate([0,0,-this.display.properties.thickness-1]);

  build=build.union(corner);
  build=build.union(corner.mirroredX());

  // Adjust build as the visible display is somewhat off center.
  build.properties.center = new CSG.Connector(
    [0, 0, 0],
    [0, 0, 1],
    [1, 0, 0]
  );

  build = build.connectTo(
    build.properties.center, 
    this.display.properties.center, 
    false,   // mirror 
    0       // normalrotation
  );

  csg = csg.union(build);

  // Add screw bosses so we can close this thing up.
  var bosses = new CSG();
  var bossclearance = new CSG();
  var barbsert = fasteners.barbsert_csg(this.screwsize);
  var boss = CSG.cylinder({
    start: [0,0,0],
    end:   [0,0,-this.topdepth+this.bezel],
    radius: barbsert.properties.params.barbsert_radius+this.bossthickness
  });

  var bosshole = barbsert.properties.hole.rotateY(180).translate([0,0,-this.topdepth+this.bezel]);

  this.screws.forEach(function(position){
    bosses=bosses.union(boss.translate(position)); 
    bossclearance=bossclearance.union(bosshole.translate(position));
  });

  csg=csg.union(bosses);
  csg=csg.subtract(bossclearance);

  // Make sure we can see out the front :)
  csg = csg.subtract(this.display.properties.cutout);

  csg=csg.setColor(0.4,0.4,0.4);
  return(csg);
};

Tablet.prototype.barbserts_csg = function() {
  var csg = new CSG();
  var barbsert = fasteners.barbsert_csg(this.screwsize);

  barbsert=barbsert.rotateY(180).translate([0,0,-this.topdepth+this.bezel]);

  this.screws.forEach(function(position){
    csg=csg.union(barbsert.translate(position)); 
  });

  return(csg);
};

Tablet.prototype.casescrews_csg = function() {
  var csg = new CSG();
  var screw = fasteners.machinescrew_csg(this.screwsize,this.screwlength);

  screw=screw.rotateY(180).translate([0,0,-this.topdepth-this.bottomdepth+this.bezel+screw.properties.params.head_height-this.middledepth]);

  this.screws.forEach(function(position){
    csg=csg.union(screw.translate(position)); 
  });

  return(csg);
};



Tablet.prototype.cornerbuild_cag = function() {
  var cag = CAG.fromPoints([

    [ this.cutoutwidth/2+this.thickness, this.cutoutheight/2+this.thickness],
//    [ this.cutoutwidth/2+thickness, this.cutoutheight/2+thickness],
    [-this.cutoutwidth/2+this.cutoutrad-this.thickness,  this.cutoutheight/2+this.thickness],
    [-this.cutoutwidth/2,  this.cutoutheight/2],
    [-this.cutoutwidth/2, -this.cutoutheight/2+this.caserad],
    [-this.cutoutwidth/2+this.caserad, -this.cutoutheight/2],
    [ this.cutoutwidth/2, -this.cutoutheight/2],
    [ this.cutoutwidth/2+this.thickness, -this.cutoutheight/2],
  ]);

  cag=cag.union(CAG.circle({
    center: [-this.cutoutwidth/2+this.caserad, -this.cutoutheight/2+this.caserad],
    radius: this.caserad
  }));

  cag=cag.translate([-this.width/2+this.cutoutwidth/2,-this.height/2+this.cutoutheight/2,0]);
/*
  cag=cag.union(CAG.circle({
    center: [ this.cutoutwidth/2-this.cutoutrad+thickness, this.cutoutheight/2-this.cutoutrad+thickness],
    radius: this.cutoutrad
  }));
 */

  return(cag);
};

Tablet.prototype.cornerbuild_csg = function() {
  csg = new CSG();

  csg=this.cornerbuild_cag().extrude({
    offset: [0, 0, -this.cutoutdepth],
  }).translate([0,0,-this.bottomdepth+this.cutoutdepth+this.thickness]);


  return(csg);
};

Tablet.prototype.cornercutout_csg = function() {
  csg = new CSG();

  var cag = CAG.rectangle({
    corner1: [-this.cutoutwidth/2, -this.cutoutheight/2],
    corner2: [ this.cutoutwidth/2,  this.cutoutheight/2],
  }); 

  cag=cag.union(CAG.circle({
    center: [ -this.cutoutwidth/2+this.caserad, -this.cutoutheight/2+this.caserad],
    radius: this.caserad-this.thickness
  }));


  csg=cag.extrude({
    offset: [0, 0, this.bottomdepth+this.thickness],
  }).translate([-this.width/2+this.cutoutwidth/2,-this.height/2+this.cutoutheight/2,-this.bottomdepth]);

  return(csg);
};

Tablet.prototype.cornercutoutinside_csg = function() {
  csg = new CSG();
  var cag = CAG.fromPoints([
    [ this.cutoutwidth/2, this.cutoutheight/2],
    [-this.cutoutwidth/2+this.thickness,  this.cutoutheight/2],

    [-this.cutoutwidth/2+this.thickness, -this.cutoutheight/2+this.caserad*2],
    [-this.cutoutwidth/2+this.caserad, -this.cutoutheight/2+this.caserad*2],
    [-this.cutoutwidth/2+this.caserad*2, -this.cutoutheight/2+this.caserad],
    [-this.cutoutwidth/2+this.caserad*2, -this.cutoutheight/2+this.thickness],

//    [-this.cutoutwidth/2+this.caserad  , -this.cutoutheight/2+this.thickness],
//    [-this.cutoutwidth/2+this.thickness, -this.cutoutheight/2+this.caserad],

    [ this.cutoutwidth/2, -this.cutoutheight/2+this.thickness],
  ]);


/*
  cag=cag.subtract(CAG.circle({
    center: [ this.cutoutwidth/2+this.cutoutrad, -this.cutoutheight/2+this.cutoutrad],
    radius: this.cutoutrad
  }));

  cag=cag.subtract(CAG.circle({
    center: [ -this.cutoutwidth/2+this.cutoutrad, +this.cutoutheight/2+this.cutoutrad],
    radius: this.cutoutrad
  }));

  cag=cag.union(CAG.circle({
    center: [ this.cutoutwidth/2-this.cutoutrad, this.cutoutheight/2-this.cutoutrad],
    radius: this.cutoutrad
  }));
 */

  cag=cag.subtract(CAG.circle({
    center: [ -this.cutoutwidth/2+this.caserad, -this.cutoutheight/2+this.caserad],
    radius: this.caserad
//-this.thickness
  }));


  csg=cag.extrude({
//    offset: [0, 0, -this.cutoutdepth-1],
    offset: [0, 0, this.bottomdepth+this.thickness],
//  }).translate([-width/2+this.cutoutwidth/2,-height/2+this.cutoutheight/2,-this.bottomdepth+this.cutoutdepth]);
  }).translate([-this.width/2+this.cutoutwidth/2,-this.height/2+this.cutoutheight/2,-this.bottomdepth]);

  return(csg);
};

Tablet.prototype.bottomcase_csg = function() {
  csg = new CSG();

  var cag = CAG.roundedRectangle({
    corner1: [-this.width/2, -this.height/2],
    corner2: [ this.width/2,  this.height/2],
    roundradius: this.caserad
  }); 

  cag = cag.subtract(CAG.roundedRectangle({
    corner1: [-this.width/2+this.thickness, -this.height/2+this.thickness],
    corner2: [ this.width/2-this.thickness,  this.height/2-this.thickness],
    roundradius: this.caserad-this.thickness
  })); 

  csg=csg.union(cag.extrude({
    offset: [0, 0, -this.bottomdepth],
  }));

  cag = CAG.roundedRectangle({
    corner1: [-this.width/2, -this.height/2],
    corner2: [ this.width/2,  this.height/2],
    roundradius: this.caserad
  }); 

  csg=csg.union(cag.extrude({
    offset: [0, 0, this.thickness],
  }).translate([0,0,-this.bottomdepth]));

  // Case lip.
  cag = CAG.roundedRectangle({
    corner1: [-this.width/2, -this.height/2],
    corner2: [ this.width/2,  this.height/2],
    roundradius: this.caserad
  }); 

  cag = cag.subtract( CAG.roundedRectangle({
    corner1: [-this.width/2+this.caselipthickness, -this.height/2+this.caselipthickness],
    corner2: [ this.width/2-this.caselipthickness,  this.height/2-this.caselipthickness],
    roundradius: this.caserad-this.caselipthickness
  })); 

  csg=csg.union(cag.extrude({
    offset: [0, 0, this.caselipheight],
  }));

  // Screw bosses.
  var bossbuild = new CSG();
  var bosscut = new CSG();
  var screw = fasteners.machinescrew_csg(this.screwsize, this.screwlength);
  var screwbase = -this.bottomdepth+screw.properties.params.head_height;

  var boss = CSG.cylinder({
    start: [0,0,-this.bottomdepth],
    end:   [0,0,0],
    radius: screw.properties.params.clearance_radius + this.bossthickness
  });
  boss=boss.union(CSG.cylinder({
    start: [0,0,-this.bottomdepth],
    end:   [0,0,screwbase],
    radiusStart: screw.properties.params.head_radius + this.bossthickness,
    radiusEnd: screw.properties.params.head_radius + this.bossthickness
  }));

  boss=boss.union(CSG.cylinder({
    start: [0,0,screwbase],
    end:   [0,0,screwbase+this.thickness],
    radiusStart: screw.properties.params.head_radius + this.bossthickness,
    radiusEnd: screw.properties.params.clearance_radius + this.bossthickness
  }));

  var screwclearance = screw.properties.clearance;

  screwclearance=screwclearance.subtract(
    CSG.cube({
      radius:[3,3,0.6/2],
      center:[0,0,-0.6/2]
  }));

  screwclearance=screwclearance.rotateY(180).translate([0,0,screwbase]);

  this.screws.forEach(function(position){
    bossbuild=bossbuild.union(boss.translate(position)); 
    bosscut=bosscut.union(screwclearance.translate(position)); 
  });

  var bossfins = new CSG();
  bossfins = bossfins.union( CSG.cube({
    corner1: [-this.thickness/2,0,-this.bottomdepth],
    corner2: [+this.thickness/2,this.caserad,-this.thickness],
  }));

  bossfins = bossfins.union( CSG.cube({
    corner1: [0,-this.thickness/2,-this.bottomdepth],
    corner2: [this.caserad,+this.thickness/2,-this.thickness],
  }));

  bossbuild=bossbuild.union(bossfins.rotateZ(90).translate(this.screws[1]));
  bossbuild=bossbuild.union(bossfins.translate(this.screws[2]));
  bossbuild=bossbuild.union(bossfins.rotateZ(-90).translate(this.screws[3]));

  csg=csg.union(bossbuild);
  csg=csg.union(this.cornerbuild_csg());

  csg=csg.subtract(bosscut);


  // Cut out area for USB+ethernet.
  //csg=csg.subtract(this.cornercutout_csg());
  csg=csg.subtract(this.cornercutoutinside_csg());

  // Hex nut for tripod mount.
  csg=csg.union(
    CSG.cube({
      corner1: [-8,  0, 0],
      corner2: [ 8,-7, this.bottomdepth]
    }).translate([0,this.height/2,-this.bottomdepth])
  );
  csg=csg.subtract(
    hex_csg( 7/16*25.4-0.4, 0.226*25.4 ).rotateX(90).rotateY(90).translate([0,this.height/2,-this.bottomdepth/2])
  );

  // Translate into the global coordinate system, and apply submodules.
  csg=csg.translate([0,0,-this.topdepth+this.bezel-this.middledepth]);

  csg=csg.subtract(this.pi.properties.clearance);
  csg=csg.union(this.pi.properties.pegs);
  csg=csg.union(this.pi.properties.clips);

  csg=csg.subtract(this.charger.properties.clearance);
  csg=csg.union(this.charger.properties.pegs);
  csg=csg.union(this.charger.properties.clips);

  csg=csg.subtract(this.battery.properties.clearance);
  csg=csg.union(this.battery.properties.bracket);

  csg=csg.union(
    CSG.cube({
      corner1: [-6,0,-this.bottomdepth-this.middledepth-this.topdepth+this.bezel],
      corner2: [6,-5,-this.bottomdepth-this.middledepth-this.topdepth+this.bezel+10]
    }).translate([55,65,0])
  );
  csg=csg.subtract(this.sw.properties.clearance);
//  csg=csg.union(this.battery.properties.bracket);

  // Screen supports.
  var self=this;
  [
    [-this.width/2+10,46,0],
    [+this.width/2-10,46,0]
  ].forEach(function (position){
    csg=csg.union(CSG.cylinder({
      start: [0,0,-self.bottomdepth-self.middledepth-self.topdepth],
      end:   [0,0,self.bezel-self.display.properties.thickness],
      radius: 6 
    }).subtract(CSG.cylinder({
      start: [0,0,-self.bottomdepth-self.middledepth-self.topdepth],
      end:   [0,0,self.bezel-self.display.properties.thickness],
      radius: 4 
    })).translate(position));
  });

  // USB cable notch.

  csg=csg.subtract(CSG.cube({
    center:[-20,-60,this.bezel-this.topdepth-this.middledepth-2],
    radius:[10,1.5,2]
  }));


  var plane = CSG.Plane.fromNormalAndPoint([0,0,-1], [0, 0, -this.bottomdepth-this.topdepth+this.bezel-this.middledepth]);
  csg=csg.cutByPlane(plane);

  csg=csg.setColor(0.35,0.35,0.35);
 
  return(csg);
};

Tablet.prototype.middlecase_csg = function() {
  csg = new CSG();

  var cag = CAG.roundedRectangle({
    corner1: [-this.width/2+this.middleshrink/2, -this.height/2+this.middleshrink],
    corner2: [ this.width/2-this.middleshrink/2,  this.height/2-this.middleshrink],
    roundradius: this.caserad
  }); 

  cag = cag.subtract(CAG.roundedRectangle({
    corner1: [-this.width/2+this.middlethickness+this.middleshrink, -this.height/2+this.middlethickness+this.middleshrink],
    corner2: [ this.width/2-this.middlethickness-this.middleshrink,  this.height/2-this.middlethickness-this.middleshrink],
    roundradius: this.caserad-this.middlethickness
  })); 

  cag = cag.union(this.cornerbuild_cag());

  var bossbuild = new CAG();
  var bosscut = new CAG();
  var screw = fasteners.machinescrew_csg(this.screwsize, this.screwlength);
  var screwbase = -this.bottomdepth+screw.properties.params.head_height;

  var boss = CAG.circle({
    center: [0,0],
    radius: screw.properties.params.clearance_radius + this.bossthickness
  });

  var screwclearance = CAG.circle({
    center: [0,0],
    radius: screw.properties.params.clearance_radius
  });

  this.screws.forEach(function(position){
    bossbuild=bossbuild.union(boss.translate(position)); 
    bosscut=bosscut.union(screwclearance.translate(position)); 

    if(position[0] > (this.height/4)) {
      bossbuild=bossbuild.union(CAG.rectangle({
        center: position,
        radius: [10,10]
      })); 
    }
  });

  var edgedis=screw.properties.params.clearance_radius + this.bossthickness;

  var cornerfill = CAG.fromPoints([
    [-edgedis,0],
    [-edgedis,this.caserad],
    [this.caserad,this.caserad],
    [this.caserad,-edgedis],
    [0,-edgedis]
  ]);

  cag=cag.union(cornerfill.rotateZ(-90).translate([this.width/2-this.caserad,  -this.height/2+this.caserad]));
  cag=cag.union(cornerfill.translate([this.width/2-this.caserad,  this.height/2-this.caserad]));
  cag=cag.union(cornerfill.rotateZ(90).translate([-this.width/2+this.caserad,  this.height/2-this.caserad]));

  cag=cag.union(bossbuild);
  cag=cag.subtract(bosscut);

  cag = cag=cag.intersect(CAG.roundedRectangle({
    corner1: [-this.width/2+this.middleshrink/2, -this.height/2+this.middleshrink],
    corner2: [ this.width/2-this.middleshrink/2,  this.height/2-this.middleshrink],
    roundradius: this.caserad
  })); 


  csg=csg.union(cag.extrude({
    offset: [0, 0, -this.middledepth],
  }));

  csg=csg.translate([0,0,-this.topdepth+this.bezel]);

  csg=csg.setColor(1,0.75,0);
  return(csg);

};

