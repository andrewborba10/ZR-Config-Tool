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
 * Create class articles
 */

 var totalZombieClasses = 0;
 var totalHumanClasses = 0;

function createZombieClass() {
/*
	$('#zombieClasses').append(
		$($.parseHTML('<article></article>'))
		.addClass('zombieClass' + totalZombieClasses++)
		.append(
 			$($.parseHTML('<h2> (Empty Class) </h2>'))
 			.addClass('classNameLabel zombieClassNameLabel')
 		)
		.append(
			$($.parseHTML('<div></div>'))
			.append(
				$($.parseHTML('<h3> General </h3>'))
			)
		 	.append(
				$($.parseHTML('<div></div>'))
				.append(
					$($.parseHTML('<div></div>'))
					.addClass('option')
					.append(
						$($.parseHTML('<p> Name: </p>'))
						.addClass('optionLabel'))

					.append(
						$($.parseHTML('<input/>'), {
							type: 'text',
							name: 'name',
							placeholder: 'Name',
							style: 'width: 175px;',
							maxlength: '64',
							required: 'true'
						})
						.addClass('className optionInput'))

					.append(
						$($.parseHTML('<p> Name of this class. </p>'))
						.addClass('optionCaption zombieRed'))
				)
			)
		)
	);
*/

	/* Clone the template zombie article and change ID */
	$('#zombieClassTemplate').clone(true).attr('id', '').addClass('zombieClass' + totalZombieClasses++).appendTo('#zombieClasses');
}

function createHumanClass() {
		/* Clone the template zombie article and change ID */
	$('#humanClassTemplate').clone(true).attr('id', '').addClass('humanClass' + totalHumanClasses++).appendTo('#humanClasses');
}

/**
 * Class label behavior
 */

function classNameValidate(classNameObj) {
	/** Check name conflicts with other classes */
	var conflict = false;
	var classNameText = $.trim(classNameObj.innerHTML);
	$('.classNameLabel').each(function () {
		if (classNameObj !== this) {
			if (this.classNameValid) {
				if (classNameText === $.trim(this.innerHTML)) {
					conflict = true;
				}
			}
		}
	})

	classNameObj.classNameValid = (classNameText != '' && !conflict);
	return classNameObj.classNameValid;
}

$('input.className').blur(function (event) {
 	var myNameLabel = $('.classNameLabel').get($(this).index('input.className'));
 	if (typeof myNameLabel != 'undefined') {
 		myNameLabel.innerHTML = this.value;
 		if (classNameValidate(myNameLabel)) {
 			if ($(myNameLabel).hasClass("zombieEmptyClassNameLabel")) {
		 		$(myNameLabel).removeClass('zombieEmptyClassNameLabel');
		 		$(myNameLabel).addClass('zombieClassNameLabel');
		 	} else if ($(myNameLabel).hasClass("humanEmptyClassNameLabel")) {
		 		$(myNameLabel).removeClass('humanEmptyClassNameLabel');
		 		$(myNameLabel).addClass('humanClassNameLabel');
		 	}
	 	}
	 	else {
	 		if ($(myNameLabel).hasClass("zombieClassNameLabel")) {
		 		$(myNameLabel).removeClass('zombieClassNameLabel');
		 		$(myNameLabel).addClass('zombieEmptyClassNameLabel');
		 	} else if ($(myNameLabel).hasClass("humanClassNameLabel")) {
		 		$(myNameLabel).removeClass('humanClassNameLabel');
		 		$(myNameLabel).addClass('humanEmptyClassNameLabel');
		 	}
		 	myNameLabel.innerHTML += " (invalid/duplicate name)";
	 	}
 	}
 });

/*
$('.classLabel').keypress(function(event){
  if ( event.which == 13 ) {
     event.preventDefault();
     document.activeElement.blur();
   }
});
*/

$('.classLabel').blur(function(evt) {
    if (classNameValidate(this)) {
    	//this.style.fontStyle = 'normal';
    	//this.style.background = 'none';
    	if (this.hasClass('zombieClassLabel')) {
    		//this.style.color = '#330000';
    		//this.style.textShadow = '0px 1px 1px #333';
    	}
    	else if (this.hasClass('humanClassLabel')) {
    		//this.style.color = '#000033';
    		//this.style.textShadow = '0px 1px 1px #333';
    	}
    } else {
    	//this.style.fontStyle = 'italic';
		//this.style.background = '#aaa';
    	//this.style.color = '#333333';
    	//this.style.textShadow = '0px 1px 0px #fff;';
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
	parentDivs = $('.accordion div'),
	childDivs = $('.accordion h3').siblings('div');
	
	$('.accordion h2').click(function(){
		toggleAccordionElement($(this));
	});
	$('.accordion h3').click(function(){
		toggleAccordionElement($(this));
	});
});

/**
 * Window load
 */

window.onload = function () {
	createZombieClass();
	createZombieClass();
	createHumanClass();
};
