cc.game.onStart = function(){
	cc.view.setDesignResolutionSize(960, 640, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
	//load resources
	cc.LoaderScene.preload(g_resources, function () {
		cc.director.runScene(new TitleScene());
	}, this);
};
cc.game.run();
