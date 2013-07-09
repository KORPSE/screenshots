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
