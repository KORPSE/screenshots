MODE_VIEW = 0;
MODE_CROP = 1;
MODE_DRAW_LINE = 2;
MODE_DRAW_RECTANGLE = 3;
MODE_PEN = 4;
MODE_BACKGROUND = 5;
MODE_TEXT = 6;
BUTTON_RELEASED = 0;
BUTTON_PRESSED = 1;
STROKE_STYLE = "rgba(255, 0, 0, 0.5)";
STROKE_WIDTH = 5;
TEXT_SIZE = 16;
LINE_ENDS = "round";

var app = {};

app.state = {
	mode: MODE_VIEW,
	buttonState: BUTTON_RELEASED,
	x0: 0,
	y0: 0,
	opacity: 100,
	currentAction: null,
	strokeStyle: STROKE_STYLE,
	strokeWidth: STROKE_WIDTH,
	textSize: TEXT_SIZE,
	zoom: 1.0,
	realWidth: 0,
	realHeight: 0,
	dragPosition: { x: 0, y: 0 },
	tools : {
		"actionHand" : MODE_VIEW,
		"actionPen" : MODE_PEN,
		"actionLine" : MODE_DRAW_LINE,
		"actionRectangle" : MODE_DRAW_RECTANGLE,
		"actionCrop" : MODE_CROP,
		"actionText" : MODE_TEXT,
		"default" : MODE_VIEW
	}
};

/**
 * Actions
 */
app.actionPerformers = [];

app.actionPerformers[MODE_DRAW_LINE] = {
	prepare: function () {},
	execute: function (action) {
		var ctx = $("#cnv")[0].getContext("2d");
		ctx.beginPath();
		ctx.moveTo(action.x0, action.y0);
		ctx.lineTo(action.x, action.y);
		ctx.lineWidth = action.strokeWidth;
		ctx.strokeStyle = action.strokeStyle;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function () {},
	update: function (action, x, y) {
		action.x = x;
		action.y = y;
	}
};

app.actionPerformers[MODE_DRAW_RECTANGLE] = {
	prepare: function() {},
	execute: function (action) {
		var ctx = $("#cnv")[0].getContext("2d");
		ctx.beginPath();
		ctx.rect(action.x0, action.y0, action.x - action.x0, action.y - action.y0);
		ctx.lineWidth = action.strokeWidth;
		ctx.strokeStyle = action.strokeStyle;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function () {},
	update: function (action, x, y) {
		action.x = x;
		action.y = y;
	}
};

app.actionPerformers[MODE_CROP] = {
	unrepeatable: true,
	jcropApi: null,
	prepare: function () {
		var jcropApi = {};

		var a = new Action (0, 0, MODE_CROP);

		function getCoords(c) {
			a.x0 = c.x / app.state.zoom;
			a.y0 = c.y / app.state.zoom;
			a.x = c.x2 / app.state.zoom;
			a.y = c.y2 / app.state.zoom;
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
			if (e.which == 13) {
				actionHandler.destroyApi();
				actionHandler.execute(a);
				$(document).trigger("setCurrentAction", [ a ]);
				$(document).trigger("releaseAction");
			}
		});
	},
	execute: function (action) {
		var cnv0 = $("#cnv0")[0];
		var newWidth = action.x - action.x0;
		var newHeight = action.y - action.y0;
		$(cnv0).pixastic("crop", {
            rect: {
                left: action.x0,
                top: action.y0,
                width: newWidth,
                height: newHeight
            }
        });
		
		$(document).trigger("rezoom");

		app.state.realWidth = newWidth;
		app.state.realHeight = newHeight;

		var cnv0 = $("#cnv0")[0];
		cnv0.removeAttribute("tabindex");
	},
	post: function () {
		if (this.jcropApi != null) {
			this.destroyApi();
		}
		$(document).off("keypress");
	},
	destroyApi: function () {
		var ctx = $("#cnv")[0].getContext("2d");
		this.jcropApi.destroy();
		$("#canvases").append(ctx.canvas);
		ctx.canvas.removeAttribute("style");
		this.jcropApi = null;
	}
};

app.actionPerformers[MODE_PEN] = {
	prepare: function () {},
	execute: function (action) {
		var ctx = $("#cnv")[0].getContext("2d");
		ctx.beginPath();
		ctx.moveTo(action.x0, action.y0);
		for (var i in action.points) {
			if (i == 0) {
				ctx.moveTo(action.points[i].x, action.points[i].y);
			} else {
				ctx.lineTo(action.points[i].x, action.points[i].y);
			}
		}
		ctx.lineWidth = action.strokeWidth;
		ctx.strokeStyle = action.strokeStyle;
		ctx.lineCap = LINE_ENDS;
		ctx.stroke();
		ctx.closePath();
	},
	post: function () {},
	update: function (action, x, y) {
		if (!action.points) {
			action.points = new Array();
			action.x0 = x;
			action.y0 = y;
			action.x = x;
			action.y = y;
			action.points.push({ x: x, y: y });
		}
		if (Math.pow(action.x - x, 2) + Math.pow(action.y - y, 2) > 6) {
			action.points.push({ x: x, y: y });
			action.x = x;
			action.y = y;
		}
	}
};

app.actionPerformers[MODE_BACKGROUND] = {
	prepare: function () {},
	execute: function (action) {
		var initPicture = $("#initImage")[0];
		var ctx = $("#cnv")[0].getContext("2d");

		$(".cnv").attr("width", initPicture.width);
		$(".cnv").attr("height", initPicture.height);

		ctx.drawImage($("#initImage")[0], 0, 0);
	},
	post: function () {}
};

app.actionPerformers[MODE_TEXT] = {
		unrepeatable: true,
		prepare: function () {
			var cnv = $("#cnv")[0];
			var ctx = cnv.getContext("2d");
			var tmpAction = new Action(cnv.width / 2, cnv.height / 2, MODE_TEXT);
			var self = this;
			this.handler = function (e) {
				ctx.clearRect(0, 0, cnv.width, cnv.height);
				self.update(
						tmpAction,
						(e.pageX + app.state.dx) / app.state.zoom,
						(e.pageY + app.state.dy) / app.state.zoom);
				self.execute(tmpAction);
			};
			this.offHandler = function () {
				$("#cnv").off("mousemove", this.handler);
			};
			this.outHandler = function () {
				ctx.clearRect(0, 0, cnv.width, cnv.height);
			};
			$("#textOptionsDialog").modal();
			var performer = this;
			$("#textOptionsDialog").on("hide", function () {
				$("#textToPut").prop("disabled", true);
				$("#cnv").on("mousemove", performer.handler);
				$("#cnv").on("mouseup", performer.offHandler);
				$("#cnv").on("mouseout", performer.outHandler);
				tmpAction.strokeStyle = app.state.strokeStyle;
				tmpAction.strokeWidth = app.state.strokeWidth;
				tmpAction.textSize = app.state.textSize;
			});
			$("#textOptionsDialog").on("shown", function () {
				$("#textToPut").prop("disabled", false);
				$("#textToPut").focus();
			});
		},
		execute: function (action) {
			var text;
			if (action.text) {
				text = action.text;
			} else if ($("#textToPut").val() != "") {
				text = $("#textToPut").val();
				action.text = text;
			} else {
				return;
			}
			var ctx = $("#cnv")[0].getContext("2d");
			ctx.fillStyle = action.strokeStyle;
			ctx.textAlign = "center";
		    ctx.textBaseline = "middle";
		    ctx.font = action.textSize + "pt Arial";
			ctx.fillText(action.text, action.x, action.y);
		},
		update: function (action, x, y) {
			action.x = x;
			action.y = y;
		},
		post: function () {
			$("#textToPut").val("");
			if (this.handler) {
				$("#cnv").off("mousemove", this.handler);
				$("#cnv").off("mouseup", this.offHandler);
				$("#cnv").off("mouseout", this.outHandler);
				this.offHandler();
			}
		},
		allowed: function () {
			return $("#textToPut").val().length > 0;
		}
	};

/**
 * Controller
 */
app.cnvController = {

	actionStack: new Array(),
	actionForwardStack: new Array(),

	dx: 0,
	dy: 0,

	updateDeltas: function () {
		var cnvs = $("#canvases")[0];
		app.state.dx = -cnvs.offsetLeft + $(app.cnvHolder).scrollLeft();
		app.state.dy = -cnvs.offsetTop + $(app.cnvHolder).scrollTop();
	},
	
	doAction: function (action) {

		if (action == null || app.actionPerformers[action.type] == undefined) {
			return;
		}

		app.actionPerformers[action.type].execute(action);
	},
	
	mergeCnv: function () {
		var cnv = $("#cnv")[0];
		var cnv0 = $("#cnv0")[0];
		cnv0.getContext("2d").drawImage(cnv, 0, 0);
		cnv.getContext("2d").clearRect(0, 0, cnv.width, cnv.height);
	},
	
	doRedraw: function (action) {

		//find last action with bitmap
		
		var startAction = -1;
		for (var i in this.actionStack) {
			if (this.actionStack[i].bitmap != undefined) {
				startAction = i;
			}
		}

		if (startAction > -1) {
			var imgData = this.actionStack[startAction].bitmap;
			var initPicture = $("#initImage")[0];
			$(".cnv").attr("width", initPicture.width);
			$(".cnv").attr("height", initPicture.height);
			$("#cnv0")[0].putImageData(imgData, 0, 0);
		}
		startAction++;

		for (var i = startAction; i < this.actionStack.length; i++) {
			this.doAction(this.actionStack[i]);
			this.mergeCnv();
		}
	},
	
	clearCnv: function () {
		var cnv = $("#cnv")[0];
		var ctx = cnv.getContext("2d");
		ctx.clearRect(0, 0, cnv.width, cnv.height);
	},

	setBack: function () {
		var action = new Action(0, 0, MODE_BACKGROUND);
		this.doAction(action);
		this.actionStack.push(action);
		this.mergeCnv();
		var initPicture = $("#initImage")[0];
		app.state.realHeight = initPicture.height;
		app.state.realWidth = initPicture.width;
		$("#leftBar .btn, #color").removeAttr("disabled");
		$("#zoomTool .btn").removeAttr("disabled");
		$("#leftBar .tool").tooltip("destroy");
		$("#pasteTextHolder").hide();
		
		var cnvHolder = $("#canvasHolder");
		app.state.zoom = 1;
		if (initPicture.width > cnvHolder.width()) {
			app.state.zoom = cnvHolder.width() / initPicture.width;
			var newHeight = initPicture.height * app.state.zoom;
			if (newHeight > cnvHolder.height()) {
				cnvHolder.height(newHeight);
			}
		}
		if (initPicture.height > cnvHolder.height()) {
			app.state.zoom = cnvHolder.height() / initPicture.height;
		}
		this.zoom(0);

	},

	down: function (e) {
		this.updateDeltas();

		if (app.state.mode == MODE_VIEW) {
			app.state.dragPosition = { x: e.pageX, y: e.pageY };
			$cnvHolder = $(app.cnvHolder);
			var controller = this;
			$cnvHolder.on("mousemove", function (e) {
				$cnvHolder.scrollLeft($cnvHolder.scrollLeft() + (app.state.dragPosition.x - e.pageX));
				$cnvHolder.scrollTop($cnvHolder.scrollTop() + (app.state.dragPosition.y - e.pageY));
				app.state.dragPosition = { x: e.pageX, y: e.pageY };
				controller.updateDeltas();
			});
			$cnvHolder.on("mouseout", function (e) {
				$cnvHolder = $(app.cnvHolder);
				$cnvHolder.off("mousemove");
				$cnvHolder.off("mouseout");
			});
			return;
		}
		
		var allowed = true;
		if (app.actionPerformers[app.state.mode]
				&& app.actionPerformers[app.state.mode].allowed) {
			allowed = app.actionPerformers[app.state.mode].allowed();
		}
		if (app.state.currentAction == null && allowed) {
			this.actionForwardStack = new Array();
			var a = new Action(
					(e.pageX + app.state.dx) / app.state.zoom,
					(e.pageY + app.state.dy) / app.state.zoom, app.state.mode);
			a.strokeStyle = app.state.strokeStyle;
			a.strokeWidth = app.state.strokeWidth;
			a.textSize = app.state.textSize;
			$(document).trigger("setCurrentAction", [ a ]);
			$("#cnv").on("mousemove", function (e) { app.cnvController.drag(e); });
			this.drag(e);
		}
	},

	up: function (e) {
		
		if (app.state.mode == MODE_VIEW) {
			$cnvHolder = $(app.cnvHolder);
			$cnvHolder.off("mousemove");
			return;
		}
		
		if (app.state.currentAction != null) {
			$(document).trigger("releaseAction");
		}
	},

	drag: function (e) {
		if (app.state.currentAction != null) {
			this.clearCnv();
			if (app.actionPerformers[app.state.currentAction.type].update) {
				app.actionPerformers[app.state.currentAction.type]
					.update(
						app.state.currentAction,
						(e.pageX + app.state.dx) / app.state.zoom,
						(e.pageY + app.state.dy) / app.state.zoom);
			}
			app.cnvController.doAction(app.state.currentAction);
		}
	},

	undo: function () {
		if (this.actionStack.length > 1) {
			var action = this.actionStack.pop();
			this.actionForwardStack.push(action);
			this.doRedraw(action);
			$(document).trigger("rezoom");
		}
	},

	redo: function () {
		if (this.actionForwardStack.length > 0) {
			var action = this.actionForwardStack.pop();
			this.actionStack.push(action);
			this.doRedraw(action);			
			$(document).trigger("rezoom");
		}
	},
	
	zoom: function (val) {
		if (val > 0) {
			app.state.zoom = Math.round((app.state.zoom + 0.1) * 10) / 10;
		} else if (val < 0 && app.state.zoom > 0.1) {
			app.state.zoom = Math.round((app.state.zoom - 0.1) * 10) / 10;
		}
		$(".cnv").each(function (index, cnv) {
			$(cnv).width(app.state.realWidth * app.state.zoom);
			$(cnv).height(app.state.realHeight * app.state.zoom);
		});
		$(document).trigger("scrollbarsTest");
		$("#zoom").text(Math.round(app.state.zoom * 100) + "%");
		
		$(document).trigger("switchCursor");
		this.updateDeltas();
	}
};


//init
$(window).load(function() {

	function refreshEventHandlers () {
		app.cnvHolder = $("#canvasHolder")[0];
		$("#cnv").off("**");
		$("#cnv").on("mousedown", function (e) { app.cnvController.down(e); });
		$("#cnv").on("mouseup", function (e) { app.cnvController.up(e); });
		app.cnvController.updateDeltas();
		$(document).off("keydown");
		$(document).keydown(function(e) {
			if(e.which === 90 && e.ctrlKey) {
				app.cnvController.undo();
				e.preventDefault();
				return false;
			} else if(e.which === 89 && e.ctrlKey) {
				app.cnvController.redo();
				e.preventDefault();
				return false;
			} else if(e.which === 107 && app.state.mode != MODE_CROP) {
				app.cnvController.zoom(1);
			} else if(e.which === 109 && app.state.mode != MODE_CROP) {
				app.cnvController.zoom(-1);
			}
			e.stopPropagation();
		});
	}
	
	function switchCursor() {
    	$cnvHolder = $("#canvasHolder");
    	$cnv = $("#cnv");
    	$cnv.removeClass("grabbable");
		$cnv.removeClass("crosshair");
    	if (app.state.mode == MODE_VIEW) {
	    	if (($cnv.width() > $cnvHolder.width())
	    					|| ($cnv.height() > $cnvHolder.height())) {
				$cnv.addClass("grabbable");
			}
    	} else {
    		$cnv.addClass("crosshair");
    	}
	}

	/**
	 *  Application events
	 */
	
    $(document).on("switchCursor", switchCursor);
	$(document).on("refreshEventHandlers", refreshEventHandlers );
	$(document).on("setCurrentAction", function (e, action) {
		app.state.currentAction = action;
	});
	
	$(document).on("releaseAction", function (e) {
		
		app.actionPerformers[app.state.mode].post();
		refreshEventHandlers();
		app.cnvController.actionStack.push(app.state.currentAction);
		if (app.actionPerformers[app.state.mode].unrepeatable) {
			app.state.mode = MODE_VIEW;
			$('[id^="action"]').removeClass("selected");
			$('[id="actionHand"]').addClass("selected");
		}
		app.state.currentAction = null;
		app.cnvController.mergeCnv();
		switchCursor();
	});

	$(document).on("scrollbarsTest", function () {
		var cnvHolder = $("#canvasHolder");
		var cnv0 = $("#cnv0");
		if (cnv0.width() <= cnvHolder.width()) {
			cnvHolder[0].style.overflowX = "";
		} else {
			cnvHolder[0].style.overflowX = "scroll";
		}
		if (cnv0.height() <= cnvHolder.height()) {
			cnvHolder[0].style.overflowY = "";
		} else {
			cnvHolder[0].style.overflowY = "scroll";
		}
	});
	
	$(document).on("rezoom", function () {
		var newWidth = $("#cnv0")[0].width;
		var newHeight = $("#cnv0")[0].height;
		var cnvHolder = $("#canvasHolder");
		if (newWidth < cnvHolder.width() && newHeight < cnvHolder.height()) {
			app.state.zoom = 1;
		} else {
			app.state.zoom = Math.min(
					cnvHolder.width() / newWidth,
					cnvHolder.height() / newHeight);
			app.cnvController.zoom(0);
		}
		$(".cnv").width(newWidth * app.state.zoom);
		$(".cnv").height(newHeight * app.state.zoom);
		var cnv = $("#cnv")[0];
		var cnv0 = $("#cnv0")[0];
		cnv.width = cnv0.width;
		cnv.height = cnv0.height;
		$("#zoom").text(Math.round(app.state.zoom * 100) + "%");
		$(document).trigger("scrollbarsTest");
	});


	
	/**
	 *  End application events
	 */
	
	if(app.cnvController.actionStack.length == 0) {
		$("#leftBar .btn, #color").attr("disabled", true);
		$("#zoomTool .btn").attr("disabled", true);
	}
    $("#leftBar .btn, #color").on("click", function (e) {
        if ($(this).attr("disabled")) {
        	e.stopImmediatePropagation();
        }
    });
    $("#leftBar .tool").tooltip( {
    	placement: "right",
    	title: app.message.please
    } );
    
	$("#button-right").toolbar({
		content: '#user-options',
		position: 'right',
		hideOnClick: true
	})
		.on('toolbarItemClick', function (event, button) {
			if (app.cnvController.actionStack.length > 0) {
				$('[id^="action"]').removeClass("selected");
				if (button.id != "undo" && button.id != "redo") {
					$(button).addClass("selected");
				}
				if (button.id == "undo") {
					app.cnvController.undo();
				} else if (button.id == "redo") {
					app.cnvController.redo();
				} else if (app.state.tools[button.id] != undefined) {
					if (app.state.mode != MODE_VIEW) { 
						app.actionPerformers[app.state.mode].post();
						$(document).trigger("refreshEventHandlers");
					}
					app.state.mode = app.state.tools[button.id];
					switchCursor();
					app.cnvController.clearCnv();
					if (app.state.mode != MODE_VIEW) { 
						app.actionPerformers[app.state.mode].prepare();
					}
					$(document).trigger("switchCursor");
				}
			}
			$('#button-right').toolbar("hide");
		});

	refreshEventHandlers();
	
	$("#color").colorpicker().on('changeColor', function(ev) {
		var rgb = ev.color.toRGB();	
		app.state.strokeStyle = "rgba(" + [rgb.r, rgb.g, rgb.b, rgb.a].join(',') + ")";
		this.style.backgroundColor = "rgba(" + [rgb.r, rgb.g, rgb.b, rgb.a].join(',') + ")";
	});

	$("#button-color").on("click", function () {
		$("#color").colorpicker("show");
	});
	
	$(".brushSize").on("click", function () {
		app.state.strokeWidth = $(this).data("value");
		$("#brush").css({
			"width": app.state.strokeWidth,
			"height": app.state.strokeWidth
		});
	});
	
	$("#textOptionsDialog").on("keypress", function (e) {
		if (e.which === 13) {
			$("#textOptionsDialog").modal("hide");
		}
	});
	
	$("#textSize").on("change", function () {
		app.state.textSize = $(this).val();
	});
	
	$("#textOk").on("click", function () {
		$("#textOptions").hide("fast");
	});
	
	$("#languageButton").on("click", function () {
		var newVal = app.locale == "ru" ? "en" : "ru";
		window.location.href = "/?lang=" + newVal;
	});
	
	$("#faq").popover(app.message.faqOptions);
	
	$("#button-zoomIn").on("click", function () {
		if ($(this).attr("disabled")) {
			return;
		}
		app.cnvController.zoom(1);
	});

	$("#button-zoomOut").on("click", function () {
		if ($(this).attr("disabled")) {
			return;
		}
		app.cnvController.zoom(-1);
	});

});

Action = function (x, y, type) {
	this.type = type;
	this.x0 = x;
	this.y0 = y;
	this.x = x;
	this.y = y;
};