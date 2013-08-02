<%@ page contentType="text/html;charset=UTF-8"%>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%
    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<title>x-shot: Edit, save and share your screenshots using only browser</title>
<link href="static/bootstrap/css/bootstrap.min.css" rel="stylesheet"
	media="screen">
<script src="http://code.jquery.com/jquery-latest.min.js"></script>
<script src="static/js/imageeditor.js"></script>
<style>
#canvasHolder {
	width: 840px;
	height: 768px;
	overflow-y: scroll;
	overflow-x: scroll;
	border: 2px dashed #cccccc;
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
	filter: alpha(opacity = 0);
	/* that one we could drop,  we're really taking about one single pixel after all */
	opacity: 0; /* we make that single box transparent */
}

[id^="button-"] {
	float: left;
	margin-right: 5px;
	margin-bottom: 5px;
	width: 19px;
	height: 18px;
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
	position: absolute;
	left: 50%;
	top: 50%;
	margin: 0px auto;
	color: #CCCCCC;
	font-size: large;
	z-index: 1;
}
#canvases {
	position: relative;
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
		app.uploadUrl = "<%= blobstoreService.createUploadUrl("/upload") %>";
	</script>
	<div class="page-header" align="center">
		<h1>X-shot</h1>
		<i>Edit, save and share your screenshots using only browser</i>
	</div>
	<div class="container">
		<div id="leftBar" style="float: left; width: 50px;">
			<div id="button-right" class="btn btn-inverse">
				<img src="static/img/icon-cog-small.png">
			</div>
			<div id="button-color" class="btn">
				<input type="hidden" class="span2" value="" >
				<i id="color" class="icon-white" data-color="rgba(255, 0, 0, 0.5)"
					data-color-format="rgba" style="background-color: rgba(255, 0, 0, 0.5)"></i>
			</div>
			<div style="display:block; padding-bottom:5px; float:left;">
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
			<div id="button-upload" class="btn">
				<img src="static/img/glyphicons_201_upload.png">
			</div>
		</div>
		<div id="canvasHolder" unselectable="yes" onselectstart="return false;" style="float: left">
			<div id="canvases">
				<canvas id="cnv0" class="cnv" width="0" height="0"></canvas>
				<canvas id="cnv" class="cnv" width="0" height="0"></canvas>
			</div>
			<div style="width: 800px; height: 700px; position: absolute; z-index: 0;" id="pasteTextHolder">
				<div id="pasteText">Ctrl-V to paste</div>
			</div>
		</div>
	</div>
	
	<div class="navbar navbar-fixed-bottom">
		<div class="navbar-inner">
			<div class="container">
				<a class="brand" href="#">x-shot</a>
				<ul class="nav">
					<li class="divider-vertical"><a href="https://github.com/KORPSE/screenshots">GitHub</a></li>
					<li class="divider-vertical"><a href="https://github.com/KORPSE">Author</a></li>
				</ul>
			</div>
		</div>
	</div>
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
			<h1>Processing...</h1>
		</div>
		<div class="modal-body">
			<div class="progress progress-striped active">
				<div class="bar" style="width: 100%;"></div>
			</div>
		</div>
	</div>
</body>
</html>