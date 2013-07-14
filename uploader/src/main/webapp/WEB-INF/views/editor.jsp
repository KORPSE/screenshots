<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

	<title>Image editor test page</title>
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
	
	#cnv {
		cursor: crosshair;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
	i[class^="icon-"] {
		margin-top: 9px;
	}
	
	.element-invisible {
		position: absolute !important;
		height: 1px;
		width: 1px;
		overflow: hidden; /* we make the box 1x1 pixel and prevent overflow */
		filter: alpha(opacity =   0);
		/* that one we could drop,  we're really taking about one single pixel after all */
		opacity: 0; /* we make that single box transparent */
	}
	
	[id^="button-"] {
		float: left;
		margin-right: 5px;
		margin-bottom: 5px;
	}
	#linkField {
		width:30em;
	}
	</style>
	<link href="static/toolbar/jquery.toolbars.css" rel="stylesheet">
	<script src="static/toolbar/jquery.toolbar.min.js"></script>
	<link rel="stylesheet" href="static/css/jquery.Jcrop.css"
		type="text/css">
	<script src="static/js/jquery.Jcrop.js"></script>
	<script src="static/js/pixastic.custom.js"></script>
</head>
<body>
	<div class="page-header">
		<h1>Shot'n'Mark</h1>
	</div>
	<div class="container">
		<div id="leftBar" style="float: left">
			<div id="button-right" class="btn btn-inverse">
				<img src="static/img/icon-cog-small.png">
			</div>
			<br>
			<div id="button-upload" class="btn">
				<img src="static/img/glyphicons_201_upload.png">
			</div>
		</div>
		<div id="canvasHolder" unselectable="yes"
			onselectstart="return false;" style="float: left">
			<canvas id="cnv" width="0" height="0"></canvas>
		</div>
	</div>
	<img id="initImage" style="display: none">

	<div id="user-options" style="display: none">
		<a href="#" id="actionPen"><i class="icon-white"
			style="background: url(static/img/glyphicons_030_pencil.png)"></i></a> <a
			href="#" id="actionLine"><i class="icon-white"
			style="background: url(static/img/glyphicons_097_vector_path_line.png)"></i></a>
		<a href="#" id="actionRectangle"><i class="icon-white"
			style="background: url(static/img/glyphicons_094_vector_path_square.png)"></i></a>
		<a href="#" id="actionCrop"><i class="icon-white"
			style="background: url(static/img/glyphicons_093_crop.png)"></i></a> <a
			href="#" id="undo"><i class="icon-fast-backward"></i></a> <a href="#"
			id="redo"><i class="icon-fast-forward"></i></a>
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
			<button class="btn btn-primary" data-dismiss="modal" aria-hidden="true">OK</button>
		</div>
	</div>
</body>
</html>