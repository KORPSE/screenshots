// проверяем, поддерживает ли браузер объект Clipboard
// если нет создаем элемент с атрибутом contenteditable
if (!window.Clipboard) {
	var pasteCatcher = document.createElement("div");

	// Firefox вставляет все изображения в элементы с contenteditable
	pasteCatcher.setAttribute("contenteditable", "");

	pasteCatcher.className = "element-invisible";
	document.body.appendChild(pasteCatcher);
 
	// элемент должен быть в фокусе
	pasteCatcher.focus();
	document.addEventListener("click", function() { pasteCatcher.focus(); });
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
  xhr.setRequestHeader(
    'Content-Type', 'multipart/form-data; boundary=' + boundary);
  xhr.sendAsBinary([
    '--' + boundary,
    'Content-Disposition: form-data; name="' + name + '"; filename="' + fn + '"',
    'Content-Type: ' + type,
    '',
    atob(data),
    '--' + boundary + '--'
  ].join('\r\n'));
  return xhr;
}

$("#button-upload").on("click", function () {
	var xhr = postCanvasToURL("upload/", "fileUpload", "screenshot.png", $("#cnv")[0], "image/png");
	xhr.onreadystatechange = function() {
		if (this.status == 200) {
			var response = $.parseJSON(this.responseText)
			$("#myModalLabel").html("Success");
			$("#myModalBody").html('Here\'s your link: <input type="text" readonly '
					+ 'value="http://localhost:8080/screenshots/get/'
					+ response.filename + '" id="linkField">');
			$("#linkField").on("click", function () {
				this.select();
			});
			$('#myModal').modal();
		} else {
			var response = $.parseJSON(this.responseText)
			$("#myModalLabel").html("Something goes wrong");
			$("#myModalBody").html(response.error);
			$('#myModal').modal();
		}
	}
});