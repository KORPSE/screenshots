MODE_VIEW = 0;
MODE_CROP = 1;
MODE_DRAW_LINE = 2;
MODE_DRAW_RECTANGLE = 3;
MODE_PEN = 4;
MODE_BACKGROUND = 5;
BUTTON_RELEASED = 0;
BUTTON_PRESSED = 1;
STROKE_STYLE = "rgba(255, 0, 0, 0.5)";
STROKE_WIDTH = 5;
LINE_ENDS = "round";

var app = {};

app.state = {
	mode: MODE_VIEW,
	buttonState: BUTTON_RELEASED,
	x0: 0,
	y0: 0,
	colour: null,
	opacity: 100,
	currentAction: null,
	tools : {
		"actionPen" : MODE_PEN,
		"actionLine" : MODE_DRAW_LINE,
		"actionRectangle" : MODE_DRAW_RECTANGLE,
		"actionCrop" : MODE_CROP,
		"default" : MODE_VIEW
	}
};

/**
 * Actions
 */
app.actionPerformers = [];

app.actionPerformers[MODE_DRAW_LINE] = {
	prepare: function (ctx) {},
	execute: function (ctx, action) {
		ctx.beginPath();
		ctx.moveTo(action.x0, action.y0);
		ctx.lineTo(action.x, action.y);
		ctx.lineWidth = STROKE_WIDTH;
		ctx.strokeStyle = STROKE_STYLE;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function (ctx, action) {},
	update: function (ctx, action, x, y) {
		action.x = x;
		action.y = y;
	},
	refreshable: true
}

app.actionPerformers[MODE_DRAW_RECTANGLE] = {
	prepare: function(ctx, action) {},
	execute: function (ctx, action) {
		ctx.beginPath();
		ctx.rect(action.x0, action.y0, action.x - action.x0, action.y - action.y0);
		ctx.lineWidth = STROKE_WIDTH;
		ctx.strokeStyle = STROKE_STYLE;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function (ctx, action) {},
	update: function (ctx, action, x, y) {
		action.x = x;
		action.y = y;
	},
	refreshable: true
}

app.actionPerformers[MODE_CROP] = {
	jcropApi: null,
	prepare: function (ctx) {
		var jcropApi = {};

		var a = new Action (0, 0, MODE_CROP);

		function getCoords(c) {
			a.x0 = c.x;
			a.y0 = c.y;
			a.x = c.x2;
			a.y = c.y2;
		};

		$("#cnv").Jcrop({
			onChange: getCoords,
			onSelect: getCoords,
			keySupport: false
		}, function () {
			jcropApi = this;
		});
		this.jcropApi = jcropApi;
		var actionHandler = this;
		$(document).keypress(function(e) {
			if(e.which == 13) {
				actionHandler.destroyApi(ctx);
				actionHandler.execute(ctx, a);
				$(document).trigger("setCurrentAction", [ a ]);
				$(document).trigger("releaseAction");
			}
		});
	},
	execute: function (ctx, action) {
		$(ctx.canvas).pixastic("crop", {
            rect: {
                left: action.x0,
                top: action.y0,
                width: action.x - action.x0,
                height: action.y - action.y0
            }
        });
		$("#cnv")[0].removeAttribute("tabindex");
	},
	post: function (ctx, action) {
		if (this.jcropApi != null) {
			this.destroyApi(ctx);
		}
		$(document).off("keypress");
	},
	destroyApi: function (ctx) {
		this.jcropApi.destroy();
		$("#canvasHolder").append(ctx.canvas);
		ctx.canvas.removeAttribute("style");
		this.jcropApi = null;
	},
	refreshable: false,
}

app.actionPerformers[MODE_PEN] = {
	prepare: function (ctx) {},
	execute: function (ctx, action) {
		ctx.beginPath();
		ctx.moveTo(action.x0, action.y0);
		for (var i in action.points) {
			if (i == 0) {
				ctx.moveTo(action.points[i].x, action.points[i].y);
			} else {
				ctx.lineTo(action.points[i].x, action.points[i].y);
			}
		}
		ctx.lineWidth = STROKE_WIDTH;
		ctx.strokeStyle = STROKE_STYLE;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function (ctx, action) {
		action.bitmap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	},
	update: function (ctx, action, x, y) {
		if (action.points == undefined) {
			action.points = new Array();
			action.x0 = x;
			action.y0 = y;
			action.x = x;
			action.y = y;
		}
		if (action.x0 > x) {
			action.x0 = x;
		}
		if (action.x < x) {
			action.x = x;
		}
		if (action.y0 > y) {
			action.y0 = y;
		}
		if (action.y < y) {
			action.y = y;
		}
		action.points.push({ x: x, y: y });
	},
	refreshable: true
}

app.actionPerformers[MODE_BACKGROUND] = {
	prepare: function (ctx) {},
	execute: function (ctx, action) {
		var initPicture = $("#initImage")[0];
		app.cnv.height = initPicture.height;
		app.cnv.width = initPicture.width;

		/*app.state.dx = -app.cnv.offsetLeft;
		app.state.dy = -app.cnv.offsetTop;*/

		ctx.drawImage($("#initImage")[0], 0, 0);
	},
	post: function (ctx, action) {},
	refreshable: true
}

app.cnvController = {

	actionStack: new Array(),
	actionForwardStack: new Array(),

	dx: 0,
	dy: 0,

	doAction: function(action) {

		if (action == null || app.actionPerformers[action.type] == undefined) {
			return;
		}

		app.actionPerformers[action.type].execute(app.ctx, action);
	},

	doRedraw: function (action) {

		//find last action with bitmap
		var startAction = -1;
		for (i in this.actionStack) {
			if (this.actionStack[i].bitmap != undefined) {
				startAction = i;
			}
		}

		if (startAction > -1) {
			var imgData = this.actionStack[startAction].bitmap;
			if (startAction < this.actionStack.length - 1 || !this.actionStack[startAction].refreshable) {
				if (app.cnv.width != imgData.width) {
					app.cnv.width = imgData.width;
				}
				if (app.cnv.height != imgData.height) {
					app.cnv.height = imgData.height;
				}
				app.ctx.putImageData(imgData, 0, 0);
			} else {
				var cx = (action.x > action.x0) ? 1 : -1;
				var cy = (action.y > action.y0) ? 1 : -1;
				app.ctx.putImageData(imgData,
					0, 0,
					action.x0 - cx * STROKE_WIDTH, action.y0 - cy * STROKE_WIDTH,
					action.x - action.x0 + cx * STROKE_WIDTH * 2, action.y - action.y0 + cy * STROKE_WIDTH * 2);
			}
		}
		startAction++;

		for (var i = startAction; i < this.actionStack.length; i++) {
			this.doAction(this.actionStack[i]);
		}
	},

	setBack: function() {
		var action = new Action(0, 0, MODE_BACKGROUND);
		this.doAction(action);
		this.actionStack.push(action);
	},

	down: function (e) {
		this.updateDeltas();
		if (app.state.mode == MODE_VIEW) {
			return;
		}
		if (app.state.currentAction == null) {
			this.actionForwardStack = new Array();
			var a = new Action(e.pageX + app.state.dx, e.pageY + app.state.dy, app.state.mode);
			$(document).trigger("setCurrentAction", [ a ]);
			$(app.cnv).on("mousemove", this.drag);
		}
	},

	up: function (e) {
		if (app.state.currentAction != null) {
			$(document).trigger("releaseAction");
		}
	},

	drag: function (e) {
		if (app.state.currentAction != null) {
			if (app.actionPerformers[app.state.currentAction.type].refreshable) {
				app.cnvController.doRedraw(app.state.currentAction);
			}
			app.actionPerformers[app.state.currentAction.type]
				.update(
					app.ctx,
					app.state.currentAction,
					e.pageX + app.state.dx,
					e.pageY + app.state.dy);
			if (app.actionPerformers[app.state.currentAction.type].refreshable) {
				app.cnvController.doAction(app.state.currentAction);
			}
		}
	},

	undo: function () {
		var action = this.actionStack.pop();
		this.actionForwardStack.push(action);
		this.doRedraw(action);
	},

	redo: function () {
		if (this.actionForwardStack.length > 0) {
			var action = this.actionForwardStack.pop();
			this.actionStack.push(action);
			this.doRedraw(action);			
		}
	},
	updateDeltas: function () {
		app.state.dx = -app.cnv.offsetLeft + $(app.cnvHolder).scrollLeft();
		app.state.dy = -app.cnv.offsetTop + $(app.cnvHolder).scrollTop();
	}
}


//init
$(window).load(function() {
	app.cnv = $("#cnv")[0];
	app.ctx = app.cnv.getContext("2d");

	function refreshEventHandlers () {
		app.cnv = $("#cnv")[0];
		app.cnvHolder = $("#canvasHolder")[0];
		app.ctx = app.cnv.getContext("2d");
		$("#cnv").off("**");
		$("#cnv").on("mousedown", function (e) { app.cnvController.down(e) });
		$("#cnv").on("mouseup", function (e) { app.cnvController.up(e) });
		app.cnvController.updateDeltas();
		$(document).off("keypress");
		$(document).keypress(function(e) {
			if(e.which == 26 || e.which == 122) {
				app.cnvController.undo();
			} else if(e.which == 25 || e.which == 121) {
				app.cnvController.redo();
			}
			e.stopPropagation();
		});
	}

	$(document).on("refreshEventHandlers", refreshEventHandlers );
	$(document).on("setCurrentAction", function (e, action) {
		app.state.currentAction = action;
	});
	$(document).on("releaseAction", function (e) {
		app.actionPerformers[app.state.mode].post(app.ctx, app.state.currentAction);
		refreshEventHandlers();
		if (!app.actionPerformers[app.state.currentAction.type].refreshable) {
			app.state.currentAction.bitmap = app.ctx.getImageData(0, 0, app.ctx.canvas.width, app.ctx.canvas.height);
		};
		app.cnvController.actionStack.push(app.state.currentAction);
		app.state.currentAction = null;
	});

	refreshEventHandlers();

	$('#button-right').toolbar({
		content: '#user-options',
		position: 'right',
		hideOnClick: true
	})
		.on('toolbarItemClick', function (event, button) {
			if (app.cnvController.actionStack.length > 0) {
				$('[id^="action"]').removeClass("selected");
				$(button).addClass("selected");
				if (button.id == "undo") {
					app.cnvController.undo();
				} else if (button.id == "redo") {
					app.cnvController.redo();
				} else if (app.state.tools[button.id] != undefined) {
					app.state.mode = app.state.tools[button.id];
					app.actionPerformers[app.state.mode].prepare(app.ctx);
				}
			}
		});
});

Action = function (x, y, type) {
	this.type = type;
	this.x0 = x;
	this.y0 = y;
	this.x = x;
	this.y = y;
}