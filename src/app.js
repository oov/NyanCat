
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.director.getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = cc.Menu.create(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = cc.LabelTTF.create("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = 0;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = cc.Sprite.create(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            rotation: 180
        });
        this.addChild(this.sprite, 0);

        var rotateToA = cc.RotateTo.create(2, 0);
        var scaleToA = cc.ScaleTo.create(2, 1, 1);

        this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));
        helloLabel.runAction(cc.Spawn.create(cc.MoveBy.create(2.5, cc.p(0, size.height - 40)),cc.TintTo.create(2.5,255,125,0)));
        return true;
    }
});

var GameOverLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.director.getWinSize();
        var sprite = cc.Sprite.create(res.title_jpg);
        sprite.attr({
            x: size.width * 0.5,
            y: size.height * 0.5,
            opacity: 0
        });
        this.addChild(sprite, 0);

        var restartItem = cc.MenuItemImage.create(
            res.restart_normal_png,
            res.restart_selected_png,
            function () {
                cc.director.runScene(cc.TransitionFade.create(0.5, new HelloWorldScene()));
            }, this);
        restartItem.attr({
            x: size.width * 0.5,
            y: 160,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var returnToTitleItem = cc.MenuItemImage.create(
            res.return_to_title_normal_png,
            res.return_to_title_selected_png,
            function () {
                cc.director.runScene(cc.TransitionFade.create(0.5, new TitleScene()));
            }, this);
        returnToTitleItem.attr({
            x: size.width * 0.5,
            y: 80,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = cc.Menu.create([restartItem, returnToTitleItem]);
        menu.attr({
          x: 0,
          y: 0,
          opacity: 0,
          enabled: false,
        });
        this.addChild(menu, 1);
        sprite.runAction(cc.FadeIn.create(0.5));
        menu.runAction(cc.Sequence.create(
          cc.DelayTime.create(0.5),
          cc.FadeIn.create(0.5),
          cc.CallFunc.create(function(){ this.enabled = true; }, menu)
        ));

        return true;
    }
});

var MyShipLayer = cc.Layer.extend({
    sprite:null,
    vy: 3,
    barrier:false,
    ctor:function () {
        this._super();
        this.sprite = cc.Sprite.create(res.nc_png);
        this.addChild(this.sprite, 0);
        var bbox = cc.size(18, 12);
        this.sprite.setPosition(bbox.width * 0.5, bbox.height * 0.5);
        this.setContentSize(bbox);
        this.scheduleUpdate();
        return true;
    },
    update:function(dt) {
        this.y += this.vy;
        this.vy -= 0.1;
    },
    jump:function() {
      this.vy = 3;
    }
});

var BlockLayer = cc.Layer.extend({
    d:null,
    vx: 0,
    vy: 0,
    ctor:function (width, height, fillcolor) {
        this._super();
        this.d = cc.DrawNode.create();
        var hw = width * 0.5, hh = height * 0.5;
        this.d.drawRect(cc.p(-hw, -hh), cc.p(hw, hh), fillcolor);
        this.addChild(this.d, 0);
        var bbox = cc.size(width, height);
        this.d.setPosition(bbox.width * 0.5, bbox.height * 0.5);
        this.setContentSize(bbox);
        this.scheduleUpdate();
        return true;
    },
    update:function(dt) {
        this.x += this.vx;
        this.y += this.vy;
    }
});

var HelloWorldScene = cc.Scene.extend({
    myShip:null,
    blocks:null,
    el:null,
    onEnter:function () {
        this._super();
        var size = cc.director.getWinSize();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
        this.myShip = new MyShipLayer();
        this.addChild(this.myShip);
        this.myShip.attr({
          x: 40,
          y: size.height / 2
        });

        this.blocks = [];
        for (var i = 0, bl; i < 16; ++i) {
          bl = new BlockLayer(
            30+Math.random()*60,
            40+Math.random()*60,
            cc.color(
              128+Math.random()*64,
              128+Math.random()*64,
              128+Math.random()*64,
              255
            )
          );
          bl.attr({
            x: size.width+Math.random()*size.width,
            y: -bl.height+Math.random()*(size.height+bl.height),
            vx: -0.5-Math.random()*3,
            vy: -0.25+Math.random()*0.5
          });
          this.addChild(bl);
          this.blocks.push(bl);
        }

        this.el = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTap,
        });
        cc.eventManager.addListener(this.el, this);
        this.scheduleUpdateWithPriority(10);
    },
    onTap:function(touch, event) {
        event.getCurrentTarget().myShip.jump();
        return true;
    },
    update:function(dt) {
      var myShipBB = this.myShip.getBoundingBox();
      var barrierBB = cc.rect(myShipBB.x-40,myShipBB.y-40,myShipBB.width+80,myShipBB.height+80);
      var size = cc.director.getWinSize();
      if (myShipBB.y+myShipBB.height < 0 || myShipBB.y > size.height) {
        this.gameover();
        return;
      }
      for(var i = this.blocks.length - 1, bl, bb; i >= 0; --i) {
        bl = this.blocks[i];
        bb = bl.getBoundingBox();
        if (this.myShip.barrier && cc.rectIntersectsRect(barrierBB, bb)) {
          var vx = (bb.x+bb.width*0.5) - (barrierBB.x+barrierBB.width*0.5);
          var vy = (bb.y+bb.height*0.5) - (barrierBB.y+barrierBB.height*0.5);
          var l = 1/Math.sqrt(vx*vx+vy*vy)*4;
          bl.attr({
            vx: vx * l,
            vy: vy * l,
          });
        }
        if (cc.rectIntersectsRect(myShipBB, bb)) {
          this.gameover();
          return;
        }
        if (bl.x+bl.width < 0 || bl.x > size.width || bl.y+bl.height < 0 || bl.y > size.height) {
          bl.attr({
            x: size.width,
            y: -bl.height+Math.random()*(size.height+bl.height),
            vx: -0.5-Math.random()*3,
            vy: -0.25+Math.random()*0.5
          });
        }
      }
    },
    gameover:function() {
      this.unscheduleUpdate();
      cc.eventManager.removeListener(this.el);

      var layer = new GameOverLayer();
      this.addChild(layer);
    }
});

var TitleLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.director.getWinSize();
        var sprite = cc.Sprite.create(res.title_jpg);
        sprite.attr({
            x: size.width * 0.5,
            y: size.height * 0.5
        });
        this.addChild(sprite, 0);

        var gameStartItem = cc.MenuItemImage.create(
            res.game_start_normal_png,
            res.game_start_selected_png,
            function () {
                cc.director.runScene(cc.TransitionFade.create(0.5, new HelloWorldScene()));
            }, this);
        gameStartItem.attr({
            x: size.width * 0.5,
            y: 80,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = cc.Menu.create(gameStartItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);
        return true;
    }
});

var TitleScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new TitleLayer();
        this.addChild(layer);
    }
});
