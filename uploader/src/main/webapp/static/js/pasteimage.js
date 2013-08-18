// проверяем, поддерживает ли браузер объект Clipboard
// если нет создаем элемент с атрибутом contenteditable
if (!window.Clipboard) {
	var pasteCatcher = document.createElement("div");

	// Firefox вставляет все изображения в элементы с contenteditable
	pasteCatcher.setAttribute("contenteditable", "");

	pasteCatcher.className = "element-invisible";
	document.body.insertBefore(pasteCatcher, document.body.firstChild);
 
	// элемент должен быть в фокусе
	pasteCatcher.focus();
	document.addEventListener("click", function(e) {
		if ($(e.target).parents(".modal").length == 0) {
			pasteCatcher.focus();
		}
	});
} 
// добавляем обработчик событию
window.addEventListener("paste", pasteHandler);
var blob;

function pasteHandler(e) {
	// если поддерживается event.clipboardData (Chrome)
	if (e.clipboardData && e.clipboardData.items) {
		// получаем все содержимое буфера
		var items = e.clipboardData.items;
		if (items) {
			// находим изображение
			for (var i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("image") !== -1) {
					// представляем изображение в виде файла
					blob = items[i].getAsFile();
					// создаем временный урл объекта
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);                
					// добавляем картинку в DOM
					createImage(source);
				}
			}
		}
	// для Firefox проверяем элемент с атрибутом contenteditable
	} else {      
		setTimeout(checkInput, 1);
	}
}
 
function checkInput() {
	var child = pasteCatcher.childNodes[0];   
	pasteCatcher.innerHTML = "";    
	if (child) {
	// если пользователь вставил изображение – создаем изображение
		if (child.tagName === "IMG") {
			createImage(child.src);
		}
	}
}
 
function createImage(source) {
	var pastedImage = $("#initImage")[0];
	pastedImage.src = source;
	pastedImage.onload = function() {
		app.cnvController.setBack();
	}
}

if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
	XMLHttpRequest.prototype.sendAsBinary = function(string) {
		var bytes = Array.prototype.map.call(string, function(c) {
			return c.charCodeAt(0) & 0xff;
		});
		this.send(new Uint8Array(bytes).buffer);
	}
}

function postCanvasToURL(url, name, fn, canvas, type) {
	var data = canvas.toDataURL(type);
	data = data.replace('data:' + type + ';base64,', '');

	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	var boundary = 'ohaiimaboundary';
	xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary='
			+ boundary);
	xhr.sendAsBinary([
			'--' + boundary,
			'Content-Disposition: form-data; name="' + name + '"; filename="'
					+ app.secureKey + '"', 'Content-Type: ' + type, '', atob(data),
			'--' + boundary + '--' ].join('\r\n'));
	return xhr;
}

$("#button-upload").on("click", function () {
	var cnv = $("#cnv0")[0];
	if (cnv.width > 0 && cnv.height > 0) {
		$("#pleaseWaitDialog").modal();
		var xhr = postCanvasToURL(app.uploadUrl, "fileUpload", "screenshot.png", cnv, "image/png");
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				$("#pleaseWaitDialog").modal("hide");
				if (this.status == 200) {
					var response = $.parseJSON(this.responseText);
					$("#myModalLabel").text("Success");
					$("#myModalBody").html('Here\'s your link: <input type="text" '
							+ 'value="'
							+ document.URL.substr(0,
									document.URL.search("#") > -1
										? document.URL.search("#") : document.URL.length).replace("www", "i")
							+ response.filename + '" id="linkField">');
					$("#linkField").mousedown(function(e) {
					    var $this = $(this);
					    $this.select();
	
					    // Work around Chrome's little problem
					    $this.mouseup(function() {
					        // Prevent further mouseup intervention
					        $this.unbind("mouseup");
					        return false;
					    });
					    return false;
					});
					$('#myModal').modal();
				} else {
					var response = $.parseJSON(this.responseText)
					$("#myModalLabel").text("Something goes wrong");
					$("#myModalBody").html(response.error);
					$('#myModal').modal();
				}
				$.get("getuploadurl").done(function (data, textStatus, jqXHR) {
					app.uploadUrl = jqXHR.responseJSON.uploadUrl;
					app.secureKey = jqXHR.responseJSON.secureKey;
				});
			}
		}
	}
});

$("#color").colorpicker().on('changeColor', function(ev){
	var rgb = ev.color.toRGB();
	this.style.backgroundColor = "rgba(" + [rgb.r, rgb.g, rgb.b, rgb.a].join(',') + ")";
});

$("#button-color").on("click", function () {
	$("#color").colorpicker("show");
});