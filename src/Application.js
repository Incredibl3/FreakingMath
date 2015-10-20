import device;

import ui.TextView as TextView;
import ui.View as View;
import ui.ScoreView as ScoreView;
import math.util as util;

import ui.widget.GridView as GridView;
import ui.widget.ButtonView as ButtonView;
import effects;

var BG_HEIGHT = 1024;
var BG_WIDTH = 576;
var score;
var app;
var isCorrectQuestion;
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

    this.setScreenDimensions(BG_WIDTH > BG_HEIGHT);

    this.view.style.backgroundColor = "#FFFFFF";

    //Gameplay view
    this._gridView = new GridView({
      superview: this.view,
      backgroundColor: "#38A8E8",
      x: 0,
      y: 0,
      width: 600,
      height: 1200,
      cols: 2,
      rows: 4,
      hideOutOfRange: true,
      showInRange: true
    });

    //Score view
    this.scoreView = new ScoreView({
      superview: this.view,
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
        superview: this.view,
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
        color: "black",
        text: "Hello Fun Incredibl3!!!"
    });

    //True button
    new GridViewSetting({
        superview: this.view,
        target: this._gridView,
        x: 30,
        y: 700,
        images: {
          up: "resources/images/correct1.png",
          down: "resources/images/correct2.png"
        },
        on: {
          up: bind(this, "onTrue")
        }
    });

    //False button
    new GridViewSetting({
        superview: this.view,
        target: this._gridView,
        x: 300,
        y: 700,
        images: {
          up: "resources/images/cancel1.png",
          down: "resources/images/cancel2.png"
        },
        on: {
          up: bind(this, "onFalse")
        }
      });
    };

    //Gameover view
    this._gridGameoverView = new GridView({
          superview: this.view,
          backgroundColor: "red",
          layout: 'box',
          centerX : true,
          y: 200,
          width: 500,
          height: 500,
          cols: 2,
          rows: 4,
          canHandleEvents: true,
          hideOutOfRange: true,
          showInRange: true,
          on:{
            up: bind(this, "reset")
          }
    });

    this.goText = new TextView({
          superview: this.view,
          target: this._gridGameoverView,
          layout: 'box',
          centerX: true,
          y: 250,
          width: 300,
          height: 300,
          verticalAlign: 'top',
          row: 1,
          colspan: 2,
          size: 128,
          wrap: true,
          color: "black",
          backgroundColor: "white",
          text: "Fucking Loser !!!"
      });

  //onClick true button
  this.onTrue = function () {
    if(isCorrectQuestion)
    {
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
      score++;
      app.scoreView.setText(score);
      generateQuestion();
    }
  };

  this.gameOver = function ()  {
    effects.shake(app.view, {duration: 500});
  }

  this.launchUI = function () {
    this.reset();
    generateQuestion();

  };

  /**
   * reset
   * ~ resets all game elements for a new game
   */
  this.reset = function(data) {
    score = 0;
    isCorrectQuestion = true;
    app._gridGameoverView.style.update({visible: false, y: -1000});
    app.goText.style.update({visible: false, y: -1000});
  };
});



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
        text: {
          color: "#000044",
          size: 11,
          autoFontSize: false,
          autoSize: false
        }
      }
    );

    supr(this, "init", [opts]);

    this._target = opts.target;
    this._textViewOpts = opts.textViewOpts;
    this._options = opts.options;
    this._optionIndex = 0;
  };
});