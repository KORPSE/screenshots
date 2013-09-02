<%@ page contentType="text/html;charset=UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<title>shoter.ru: <spring:message code="msg.subtitle"/></title>
<link href="static/bootstrap/css/bootstrap.min.css" rel="stylesheet"
	media="screen">
<script src="http://code.jquery.com/jquery-latest.min.js"></script>
<script src="static/js/imageeditor.js"></script>
<link href="static/favicon.ico" rel="icon" type="image/x-icon">
<style>
html {
	height: 100%;
}

.page-header {
	margin-bottom: 10px;
}

#canvasHolder {
	width: 840px;
	height: 475px;
	border: 2px dashed #CCCCCC;
	background: #EEEEEE;
}

canvas.cnv {
	cursor: crosshair;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	display: block;
	position: absolute;
}

#cnv0 {
	z-index: 20;
}

#cnv {
	z-index: 21;
}

.tool-container i[class^="icon-"] {
	margin-top: 9px;
}

.element-invisible {
	position: fixed !important;
	top: -100px;
	left: -100px;
	height: 1px;
	width: 1px;
	overflow: hidden; /* we make the box 1x1 pixel and prevent overflow */
	filter: alpha(opacity =   0);
	/* that one we could drop,  we're really taking about one single pixel after all */
	opacity: 0; /* we make that single box transparent */
}

[id^="button-"] {
	width: 19px;
	height: 18px;
}

#leftBar [id^="button-"] {
	float: left;
	margin-right: 5px;
	margin-bottom: 5px;
}

#linkField {
	width: 30em;
}

#link-brushsize {
	display: table-cell;
	width: 19px;
	height: 28px;
	vertical-align: middle;
	margin-right: 5px;
	margin-bottom: 5px;
}

#brush {
	width: 5px;
	height: 5px;
	background-color: black;
	display: inline-block;
	border-radius: 50%;
}

#pasteText {
	color: #999999;
	font-size: 16px;
	font-style: italic;
	z-index: 1;
}

#pasteTextHolder {
	text-align: center;
	display: table-cell;
	vertical-align: middle;
	text-align: center;
	display: table-cell;
	vertical-align: middle;
	z-index: 0;
	width: 840px;
	height: 475px;
}

#canvases {
	position: relative;
}

.bigicon {
	width: 27px !important;
	height: 23px !important;
	margin-top: -2px;
}

#textOk {
	width: 25px;
	height: 19px;
	background: url('static/img/glyphicons_206_ok_2.png');
}

#zoomTool {
	float: left;
	display: block;
	width: 894px;
	margin-right: 46px;
}

#zoomTool * {
	float: right;
	margin-left: 5px;
	margin-bottom: 5px;
}

#zoom {
	border: 1px solid #CCCCCC;
	border-radius: 3px;
	background: #EEEEEE;
	padding: 3px 5px;
}

#keyIcon {
	color: #BBBBBB;
	font-size: large;
	background: #F6F6F6;
	line-height: 50px;
	padding: 5px 8px;
	border-radius: 5px;
	-webkit-box-shadow: 4px 4px 4px rgba(50, 50, 50, 0.23);
	-moz-box-shadow: 4px 4px 4px rgba(50, 50, 50, 0.23);
	box-shadow: 4px 4px 4px rgba(50, 50, 50, 0.23);
}
.page-footer {
	display:block;
	color: #AAAAAA;
	border-top: 1px solid #eee;
	margin-top: 50px;
	margin-left: auto;
	margin-right: auto;
	font-size: 12px;
	font-weight: bold;
	width: 840px;
}
</style>
<link href="static/toolbar/jquery.toolbars.css" rel="stylesheet">
<script src="static/toolbar/jquery.toolbar.min.js"></script>
<link rel="stylesheet" href="static/css/jquery.Jcrop.css"
	type="text/css">
<script src="static/js/jquery.Jcrop.js"></script>
<link href="static/colorpicker/css/colorpicker.css" rel="stylesheet">
<script src="static/colorpicker/js/bootstrap-colorpicker.js"></script>
<script src="static/js/pixastic.custom.js"></script>
</head>
<body>
	<script>
		app.uploadUrl = "${uploadUrl}";
		app.secureKey = "${secureKey}";
		app.locale = '<spring:message code="locale"/>';
		app.message = {
			link: '<spring:message code="msg.link"/>',
			fail: '<spring:message code="msg.fail"/>',
			please: '<spring:message code="msg.please"/>',
			success: '<spring:message code="msg.success"/>',
			faqOptions: {
				title: '<spring:message code="msg.faq.title"/>',
				content: '<spring:message htmlEscape="false" code="msg.faq.content"/>',
				html: true,
				placement: "bottom"
			}
		};
	</script>
	<a href="https://github.com/KORPSE/screenshots"><img
		style="position: absolute; top: 0; right: 0; border: 0;"
		src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"
		alt="Fork me on GitHub"></a>
	<div class="page-header" style="margin-left: auto; margin-right:auto; width: 840px;">
		<div class="pull-right">
			<button class="btn btn-small btn-info inline" id="faq">FAQ</button>
			<button class="btn btn-small btn-primary" id="languageButton">rus/en</button>
		</div>
		<h1>Shoter</h1>
		<i><spring:message code="msg.subtitle"/></i>
	</div>
	<div class="container" style="margin-bottom: 10px;">
		<div id="zoomTool">
			<div id="button-zoomIn" class="btn tool inline">
				<img src="static/img/glyphicons_236_zoom_in.png">
			</div>
			<div id="button-zoomOut" class="btn tool inline">
				<img src="static/img/glyphicons_237_zoom_out.png">
			</div>
			<div id="zoom">-</div>
		</div>
		<div id="leftBar" style="float: left; width: 50px;">
			<div id="button-right" class="btn btn-inverse tool">
				<img src="static/img/icon-cog-small.png">
			</div>
			<div id="button-color" class="btn tool">
				<input type="hidden" class="span2" value="" >
				<i id="color" class="icon-white" data-color="rgba(255, 0, 0, 0.5)"
					data-color-format="rgba" style="background-color: rgba(255, 0, 0, 0.5)"></i>
			</div>
			<div style="display:block; padding-bottom:5px; float:left;" class="tool">
				<div class="dropdown">
					<div id="link-brushsize" class="dropdown-toggle btn" data-toggle="dropdown">
						<i id="brush"></i>
					</div>
					<ul id="brushMenu" class="dropdown-menu" role="menu" aria-labelledby="link-brushsize">
						<li>
							<a href="#" class="brushSize" data-value="1">1 px</a>
							<a href="#" class="brushSize" data-value="2">2 px</a>
							<a href="#" class="brushSize" data-value="5">5 px</a>
							<a href="#" class="brushSize" data-value="8">8 px</a>
							<a href="#" class="brushSize" data-value="10">10 px</a>
							<a href="#" class="brushSize" data-value="12">12 px</a>
						</li>
					</ul>
				</div>
			</div>
			<div id="button-upload" class="btn tool">
				<img src="static/img/glyphicons_201_upload.png">
			</div>
		</div>
		<div id="canvasHolder" unselectable="yes" onselectstart="return false;" style="float: left">
			<div id="canvases">
				<canvas id="cnv0" class="cnv" width="0" height="0"></canvas>
				<canvas id="cnv" class="cnv" width="0" height="0"></canvas>
				<div id="pasteTextHolder">
					<span id="keyIcon">Ctrl+V</span>
					<div id="pasteText"><spring:message code="msg.paste"/></div>
				</div>
			</div>
		</div>
	</div>
	<div align="center" class="page-footer">Created by <a href="http://vk.com/xkorpsex">I.Simonenko</a>, 2013</div>
	
	<img id="initImage" style="display: none">

	<div id="user-options" style="display: none">
		<a href="#" id="actionPen">
		<i class="icon-white"
			style="background: url(static/img/glyphicons_030_pencil.png)"></i></a>
		<a href="#" id="actionLine">
			<i class="icon-white" style="background: url(static/img/glyphicons_097_vector_path_line.png)"></i>
		</a>
		<a href="#" id="actionRectangle">
			<i class="icon-white" style="background: url(static/img/glyphicons_094_vector_path_square.png)"></i>
		</a>
		<a href="#" id="actionText">
			<i class="icon-white" style="background: url(static/img/glyphicons_103_text_underline.png)"></i>
		</a>
		<a href="#" id="actionCrop">
			<i class="icon-white" style="background: url(static/img/glyphicons_093_crop.png)"></i>
		</a>
		<a href="#" id="undo">
			<i class="icon-fast-backward"></i>
		</a>
		<a href="#" id="redo">
			<i class="icon-fast-forward"></i>
		</a>
	</div>
	
	<script src="static/bootstrap/js/bootstrap.min.js"></script>
	<script src="static/js/pasteimage.js"></script>

	<!-- Modal -->
	<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog"
		aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal"
				aria-hidden="true">×</button>
			<h3 id="myModalLabel">Modal header</h3>
		</div>
		<div class="modal-body">
			<p id="myModalBody">One fine body…</p>
		</div>
		<div class="modal-footer">
			<button class="btn btn-primary" data-dismiss="modal" hidden="true">OK</button>
		</div>
	</div>

	<div class="modal hide fade" id="pleaseWaitDialog" data-backdrop="static"
		data-keyboard="false">
		<div class="modal-header">
			<h1><spring:message code="msg.processing"/></h1>
		</div>
		<div class="modal-body">
			<div class="progress progress-striped active">
				<div class="bar" style="width: 100%;"></div>
			</div>
		</div>
	</div>
	<div class="modal hide fade" id="textOptionsDialog" data-backdrop="static"
		data-keyboard="false">
		<div class="modal-header">
			<h1><spring:message code="msg.textOptions"/></h1>
		</div>
		<div class="modal-body">
			<div class="form-inline" id="textOptions">
				<i class="icon-white bigicon" style="background:url('static/img/glyphicons_100_font.png');"></i>
				<input type="text" class="input-xlarge" id="textToPut" placeholder="Text" style="height: 30px">
				<select id="textSize" style="width:90px;">
					<option value="10">10px</option>
					<option value="12">12px</option>
					<option value="16" selected="selected">16px</option>
					<option value="20">20px</option>
					<option value="24">24px</option>
					<option value="28">28px</option>
				</select>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn btn-primary" data-dismiss="modal" hidden="true">OK</button>
		</div>		
	</div>
		
</body>
</html>