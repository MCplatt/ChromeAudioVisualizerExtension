var getRandomButterPresetName = function() {
    var butterPresetsName = Object.keys(butter.getPresets());
    return butterPresetsName[Math.floor(Math.random() * butterPresetsName.length)];
}
ButterSceneSettings = function()
{
    this.presets = {
        availableValues: Object.keys(butter.getPresets()),
        attribName: 'preset',
    };
    this.preset = getRandomButterPresetName();
    this.blendLength = 5;
    this.cyclePresets = true;
    this.cycleSeconds = 20;

};
AudioScenes.ButterScene = function()
{
    this.name = "MilkDrop";
};
AudioScenes.ButterScene.prototype.init = function(){
	g.port.postMessage(AV.butterOn);
    initCanvas('buttergl', true);
    this.visualizer = butter.start(function(){
        return Object.values(g.byteFrequency.timeByteArray||g.byteFrequency);
    },function(){
        return Object.values(g.byteFrequency.timeByteArrayL||g.byteFrequency);
    }, function(){
        return Object.values(g.byteFrequency.timeByteArrayR||g.byteFrequency);
    },g.canvas, s.widthInHalf*2, s.heightInHalf*2);
    this.lastPreset = undefined;

    this.visualizer.setRendererSize(s.widthInHalf*2, s.heightInHalf*2);
};
AudioScenes.ButterScene.prototype.cleanUp = function()
{
    clearInterval(this.timeout);    
    this.timeout = undefined;
    delete this.visualizer;
    g.port.postMessage(AV.butterOff);
	initCanvas("2d");
	canvasResize();
},
AudioScenes.ButterScene.prototype.parseSettings = function(preset)
{
	parseSettings(this,ButterSceneSettings, preset);
};
AudioScenes.ButterScene.prototype.clearBg = function()
{
};
AudioScenes.ButterScene.prototype.resizeCanvas = function()
{
    if (this.visualizer) {
        this.visualizer.setRendererSize(s.widthInHalf*2, s.heightInHalf*2);
    }
};
AudioScenes.ButterScene.prototype.update = function()
{
    if (this.settings.preset !== this.lastPreset) {
        this.visualizer.loadPreset(butter.getPresets()[this.settings.preset], this.settings.blendLength);
        this.lastPreset = this.settings.preset;
        clearInterval(this.timeout);
        this.timeout = undefined;
    }
    if (this.settings.cyclePresets) {
        if (!this.timeout){
            this.timeout = setTimeout(function(){
                this.settings.preset = getRandomButterPresetName();
                clearInterval(this.timeout);
                this.timeout = undefined;
            }.bind(this), this.settings.cycleSeconds * 1000);
            this.lastCycleSeconds = this.settings.cycleSeconds;
        }
        else if (this.settings.cycleSeconds !== this.lastCycleSeconds) {
            clearInterval(this.timeout);
            this.timeout = undefined;
        }
    }
    else if(this.timeout) {
        clearInterval(this.timeout);
        this.timeout = undefined;
    }
    this.visualizer.render();
};
