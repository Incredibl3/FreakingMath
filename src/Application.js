import device;

import ui.TextView as TextView;
import ui.View as View;
import ui.ScoreView as ScoreView;
import math.util as util;
import ui.ImageView as ImageView;

import ui.widget.GridView as GridView;
import ui.widget.ButtonView as ButtonView;
import effects;
import animate;

var BG_HEIGHT = 1024;
var BG_WIDTH = 576;
var TIMEOUT = 1500;
var bestScore;
var score;
var app;
var isCorrectQuestion;
var isFirstTime;

exports = Class(GC.Application, function () {

  /**
   * setScreenDimensions
   * ~ normalizes the game's root view to fit any device screen
   */
  this.setScreenDimensions = function(horz) {
    var ds = device.screen;
    var vs = this.view.style;
    vs.width = horz ? ds.width * (BG_HEIGHT / ds.height) : BG_WIDTH;
    vs.height = horz ? BG_HEIGHT : ds.height * (BG_WIDTH / ds.width);
    vs.scale = horz ? ds.height / BG_HEIGHT : ds.width / BG_WIDTH;
  };

  this.initUI = function () {
    app = this;
    bestScore = 0;
    this.setScreenDimensions(BG_WIDTH > BG_HEIGHT);

    this.view.style.backgroundColor = "#FFFFFF";

    //Gameplay view
    this._gridView = new GridView({
      superview: this.view,
      backgroundColor: "#7f8c8d",
      x: 0,
      y: 0,
      width: 600,
      height: 1200,
      cols: 2,
      rows: 4,
      hideOutOfRange: true,
      showInRange: true
    });

    //Countdown tier
    this.timerView = new View({
        superview: this._gridView,
        target: this._gridView,
        layout: 'box',
        x: 0,
        y: 0,
        width: BG_WIDTH,
        height: 30,
        row: 0,
        colspan: 2,
        backgroundColor: "white"
    });

    //Score view
    this.scoreView = new ScoreView({
      superview: this._gridView,
      target: this._gridView,
      x: 0,
      y: 100,
      width: BG_WIDTH,
      height: 75,
      text: "0",
      horizontalAlign: "center",
      spacing: 0,
      characterData: {
        "0": { image: "resources/images/txt_0.png" },
        "1": { image: "resources/images/txt_1.png" },
        "2": { image: "resources/images/txt_2.png" },
        "3": { image: "resources/images/txt_3.png" },
        "4": { image: "resources/images/txt_4.png" },
        "5": { image: "resources/images/txt_5.png" },
        "6": { image: "resources/images/txt_6.png" },
        "7": { image: "resources/images/txt_7.png" },
        "8": { image: "resources/images/txt_8.png" },
        "9": { image: "resources/images/txt_9.png" }
      },
      row: 1,
      colspan: 2
    });

    //Question
    this.question = new TextView({
        superview: this._gridView,
        target: this._gridView,
        layout: 'box',
        centerX: true,
        y: 250,
        width: 400,
        height: 400,
        verticalAlign: 'top',
        row: 1,
        colspan: 2,
        size: 128,
        wrap: true,
        color: "white",
        fontFamily: 'BPreplayBold',
        text: "Hello Fun Incredibl3!!!"
    });

    //True button
    this.trueBtn = new GridViewSetting({
        superview: this._gridView,
        target: this._gridView,
        x: 30,
        y: 700,
        images: {
          up: "resources/images/true1.png",
          down: "resources/images/true2.png",
          disabled: "resources/images/true1.png"
        },
        on: {
          up: bind(this, "onTrue")
        }
    });

    //False button
    this.falseBtn = new GridViewSetting({
        superview: this._gridView,
        target: this._gridView,
        x: 300,
        y: 700,
        images: {
          up: "resources/images/false1.png",
          down: "resources/images/false2.png",
          disabled: "resources/images/false1.png"
        },
        on: {
          up: bind(this, "onFalse")
        }
      });

    this._gridGameoverView = new ImageView({
          superview: this.view,
          layout: 'box',
          centerX : true,
          y: 200,
          width: 450,
          height: 300,
          cols: 2,
          rows: 4,
          canHandleEvents: true,
          hideOutOfRange: true,
          showInRange: true,
          zIndex: 5,
          image: "resources/images/gameoverbg.png"
    });

    this.goText = new TextView({
          superview: this._gridGameoverView,
          target: this._gridGameoverView,
          layout: 'box',
          centerX: true,
          y: 20,
          width: 300,
          height: 300,
          verticalAlign: 'top',
          row: 1,
          colspan: 2,
          zIndex: 5,
          size: 40,
          wrap: true,
          color: "white",
          fontFamily: 'BPreplayBold',
          canHandleEvents: true,
          text: "Game Over \n\n New:  1 \n Best: 2"
    });

    this.btnPlay = new ButtonView({
          superview: this._gridGameoverView,
          target: this._gridGameoverView,
          layout: 'box',
          x: 50,
          y: 210,
          width: 152,
          height: 75,
          verticalAlign: 'top',
          row: 1,
          cols: 0,
          zIndex: 5,
          size: 40,
          wrap: true,
          image: "resources/images/play.png",
          canHandleEvents: true,
          hideOutOfRange: true,
          showInRange: true,
          zIndex: 5,
          on:{
            up: bind(this, "reset")
          }
    });

    this.btnBack = new ButtonView({
          superview: this._gridGameoverView,
          target: this._gridGameoverView,
          layout: 'box',
          x: 250,
          y: 210,
          width: 152,
          height: 75,
          verticalAlign: 'top',
          row: 1,
          cols: 1,
          zIndex: 5,
          size: 40,
          wrap: true,
          image: "resources/images/back.png",
          canHandleEvents: true,
          hideOutOfRange: true,
          showInRange: true,
          zIndex: 5
    });

  };
  //onClick true button
  this.onTrue = function () {
    if(isCorrectQuestion)
    {
      resetTimerView();
      score++;
      app.scoreView.setText(score);
      generateQuestion();
    }else{
      this.gameOver();
    }
  };

  //onClick false button
  this.onFalse = function () {
    if(isCorrectQuestion)
    {
      this.gameOver();
    }else{
      resetTimerView();
      score++;
      app.scoreView.setText(score);
      generateQuestion();
    }
  };

  this.gameOver = function ()  {
    if(bestScore < score)
      bestScore = score;
    app.goText.setText("Game Over \n\n New:  "+score+" \nBest:  "+bestScore);
    animate(app.timerView).clear();
    effects.shake(app._gridView, {scale: 1, duration: 500});
    app._gridGameoverView.show();
    app.trueBtn.setState(ButtonView.states.DISABLED);
    app.falseBtn.setState(ButtonView.states.DISABLED);
  }

  this.launchUI = function () {
    this.reset();

  };

  /**
   * reset
   * ~ resets all game elements for a new game
   */
  this.reset = function(data) {
    score = 0;
    isFirstTime = true;
    app.scoreView.setText(score);
    isCorrectQuestion = true;
    app._gridGameoverView.hide();
    generateQuestion();
    app.trueBtn.setState(ButtonView.states.UP);
    app.falseBtn.setState(ButtonView.states.UP);
    randomBackground();
  };
});

function randomBackground(){
  var bgArray = ["#7f8c8d","#8C43AD","#F39C12","#D15400","#25AE5D","#FF4444","#33B5E5","#FFBB33","#99CC00"];
  var rand = bgArray[Math.floor(Math.random() * bgArray.length)];
  app._gridView.style.update({backgroundColor: rand});
}

function resetTimerView(){
  animate(app.timerView).clear();
  app.timerView.style.update({width: BG_WIDTH});
}

function generateQuestion(){
  var a, b, result;
  if(score < 5)
  { 
    a = util.random(1, 5);
    b = util.random(1, 5);
  }else if(score < 10){
    a = util.random(5, 10);
    b = util.random(5, 10);
  }else{
    a = util.random(10, 15);
    b = util.random(10, 15);
  }
  //var operation = util.random(1,5); //1: add, 2: sub, 3: mul, 4: div
  //for testing only add and sub: ez kill
  var operation = util.random(1,3);
  var opStr = "";
  switch (operation)
  {
    case 1:
      opStr = "+";
      result = a + b;
      break;
    case 2:
      opStr = "-";
      result = a - b;
      break;
    case 3:
      opStr = "x";
      result = a * b;
      break;
    case 4:
      opStr = "/";
      result = a / b;
      break;
    default:
      opStr = "+";
      result = a + b;
      break;
  }

  var useFakeQuestion = util.random(1,3); //1: correct question, 2: wrong question
  if(useFakeQuestion == 2)
  {
    result = result + util.random(1,4);
    isCorrectQuestion = false;
  }else{
    isCorrectQuestion = true;
  }

  app.question.setText(a + " " + opStr + " " + b + " =" + result);

  if(isFirstTime)
    isFirstTime = false;
  else
    startCountdownTimer();
 }

function startCountdownTimer(){
  animate(app.timerView).now({width: 0}, TIMEOUT, animate.linear).then(app.gameOver.bind());
}

var GridViewSetting = Class(ButtonView, function (supr) {
  this.init = function (opts) {
    opts = merge(
      opts,
      {
        width: 250,
        height: 300,
        sourceSlices: {
          horizontal: {left: 80, center: 116, right: 80},
          vertical: {top: 10, middle: 80, bottom: 10}
        },
        destSlices: {
          horizontal: {left: 40, right: 40},
          vertical: {top: 4, bottom: 4}
        },
        zIndex: 0,
        text: {
          color: "#000044",
          size: 11,
          autoFontSize: false,
          autoSize: false
        }
      }
    );

    supr(this, "init", [opts]);

    // this._target = opts.target;
    this._textViewOpts = opts.textViewOpts;
    this._options = opts.options;
    this._optionIndex = 0;
  };
});