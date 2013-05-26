/**
 * Utilities
 */

 function selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/**
 * Class label behavior
 */

function classNameValidate(className) {
	/** Check name conflicts with other classes */
	var conflict = false;
	var classNameText = $.trim(className.innerHTML);
	$(".classLabel").each(function () {
		if (className !== $(this)[0]) {
			if ($(this)[0].classNameValid) {
				if (classNameText === $.trim($(this).text())) {
					conflict = true;
				}
			}
		}
	})

	className.classNameValid = (classNameText != "" && !conflict);
	return className.classNameValid;
}

/*
$(".classLabel").keypress(function(event){
  if ( event.which == 13 ) {
     event.preventDefault();
     document.activeElement.blur();
   }
});
*/

$(".classLabel").blur(function(evt) {
    if (classNameValidate(this)) {
    	//this.style.fontStyle = "normal";
    	//this.style.background = "none";
    	if (this.hasClass("zombieClassLabel")) {
    		//this.style.color = "#330000";
    		//this.style.textShadow = "0px 1px 1px #333";
    	}
    	else if (this.hasClass("humanClassLabel")) {
    		//this.style.color = "#000033";
    		//this.style.textShadow = "0px 1px 1px #333";
    	}
    } else {
    	//this.style.fontStyle = "italic";
		//this.style.background = "#aaa";
    	//this.style.color = "#333333";
    	//this.style.textShadow = "0px 1px 0px #fff;";
    }
    return false;
});

/**
 * Nested accordion
 */

function toggleAccordionElement(element) {
	if(element.next().is(':hidden')) {
		element.next().slideDown();
	} else {
		element.next().slideUp();
	}
}

$(document).ready(function() {
	var parentDivs = $('.accordion div'),
	childDivs = $('.accordion h3').siblings('div');

	$.each(childDivs, function () {
		$(this).slideUp(0);
	});
	
	$('.accordion h2').click(function(){
		//parentDivs.slideUp();
		if($(this).next().is(':hidden')){
			$(this).next().slideDown();
		}else{
			$(this).next().slideUp();
			childDivs.slideUp();
		}
	});
	$('.accordion h3').click(function(){
		//childDivs.slideUp();
		if($(this).next().is(':hidden')){
			$(this).next().slideDown();
		}else{
			$(this).next().slideUp();
		}
	});
});

/**
 * Window load
 */

window.onload = function () {
};
