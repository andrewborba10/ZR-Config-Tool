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
 * Create/delete class articles
 */

var totalClasses = 0;
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
	var newClass = $('#zombieClassTemplate').clone(true).attr('id', 'zombieClass' + totalClasses).data('classIndex', totalClasses).appendTo('#zombieClasses .accordion');
	$('input', newClass).each(function () {
		$(this).attr('name', $(this).attr('name').replace('#', totalClasses));
	});

	/* HACK:
	 *
	 * Problem: The templates have the same 'name' attributes which radio buttons are sensitive to.
	 * The default checked radio button is only working on the last template because it's overriding the ones in the first template.
	 * However, the 'checked' properties still exist in the radio input elements in the first template.  Since when a new class is
	 * cloned and the names are all made unique, all we have to do is disable/enable the 'checked' attribute to fix the issue.
	 *
	 * Note: This fix is only needed in Chrome. (only tested in FF and Chrome).
	 *
	 * Description: Copy over default radio button checked state
	 */
	var templateRadioButtons = $('input[type=radio]', $('#zombieClassTemplate'));
	$('input[type=radio]', newClass).each(function (i, val) {
		if ($(templateRadioButtons[i]).attr('checked')) {
			$(this).prop('checked', false);
			$(this).prop('checked', true);
		}
	});

	totalClasses++;
	totalZombieClasses++;

	return newClass[0];
}

function createHumanClass() {
	/* Clone the template zombie article and change ID */
	var newClass = $('#humanClassTemplate').clone(true).attr('id', 'humanClass' + totalClasses).data('classIndex', totalClasses).appendTo('#humanClasses .accordion');
	$('input', newClass).each(function () {
		$(this).attr('name', $(this).attr('name').replace('#', totalClasses));
	});

	/* HACK:
	 *
	 * Problem: The templates have the same 'name' attributes which radio buttons are sensitive to.
	 * The default checked radio button is only working on the last template because it's overriding the ones in the first template.
	 * However, the 'checked' properties still exist in the radio input elements in the first template.  Since when a new class is
	 * cloned and the names are all made unique, all we have to do is disable/enable the 'checked' attribute to fix the issue.
	 *
	 * Note: This fix is only needed in Chrome. (only tested in FF and Chrome).
	 *
	 * Description: Copy over default radio button checked state
	 */
	var templateRadioButtons = $('input[type=radio]', $('#humanClassTemplate'));
	$('input[type=radio]', newClass).each(function (i, val) {
		if ($(templateRadioButtons[i]).attr('checked')) {
			$(this).prop('checked', false);
			$(this).prop('checked', true);
		}
	});

	totalClasses++;
	totalHumanClasses++;

	return newClass[0];
}

function deleteClassArticle(classObj) {
	$('.classContent', classObj).slideUp(500, function () {
		$(classObj).remove();
	});
}

function deleteZombieClass(classObj) {
	deleteClassArticle(classObj);
	totalZombieClasses--;
}

function deleteHumanClass(classObj) {
	deleteClassArticle(classObj);
	totalHumanClasses--;
}

/*
 * Add/Delete buttons
 */

$('#zombieClasses .addClassButton').click(function (event) {
	var newClass = createZombieClass();
	$(newClass).slideUp(0);
	$(newClass).slideDown(1000);

});

$('#humanClasses .addClassButton').click(function (event) {
	var newClass = createHumanClass();
	$(newClass).slideUp(0);
	$(newClass).slideDown(1000);

});

$('#zombieClasses img.deleteClassButton').click( function (event) {
	deleteZombieClass($(this).parents('article')[0]);
	event.preventDefault();
});

$('#humanClasses img.deleteClassButton').click( function (event) {
	deleteHumanClass($(this).parents('article')[0]);
	event.preventDefault();
});

 /*
  * Convenience functions for constructing the jquery selector for each input element given the class article obj and input name.
  */

function getClassInputName(classObj, input) {
	return input + $(classObj).data('classIndex');
}

function getClassInputSelector(classObj, input) {
	return 'input[' + 'name=' + getClassInputName(classObj, input) + ']';
}


/**
 * Returns a jquery object containing input elements (only more than one for checkboxes, radio buttons, etc)
 */
function getClassInput(classObj, input) {
	return $(getClassInputSelector(classObj, input), $(classObj));
}

/* Config option validation functions */

function isClassNameUnique(classObj) {
	/** Check if the value of the class name input conflicts with any other classes. */
	var conflict = false;
	var className = $.trim(getClassInput(classObj, 'name').val());
	$('body article').each(function () {
		if (classObj !== this) {
			if ($(this).data('valid'))
			{
				if (className === $.trim(getClassInput(this, 'name').val())) {
					conflict = true;
				}
			}
		}
	});
	return !conflict;
}

function isClassNameValid(classObj) {
	/** Check name conflicts with other classes */
	$(classObj).data('valid', ($.trim(getClassInput(classObj, 'name').val()) !== '' && isClassNameUnique(classObj)));
	return $(classObj).data('valid');
}

function isClassDescriptionValid(classObj) {
	return ($.trim(getClassInput(classObj, 'description').val()) !== '');
}

function isClassEnabledValid(classObj) {
	return (getClassInput(classObj, 'enabled').is(':checked'));
}

function isClassDefaultValid(classObj) {
	return (getClassInput(classObj, 'team_default').is(':checked'));
}

function isClassFlagsValid(classObj) {
	return true;
}

function isClassGroupValid(classObj) {
	return true;
}

function isClassModelValid(classObj) {
	return ($.trim(getClassInput(classObj, 'model_path').val()) !== '');
}

function isClassModelSkinIndexValid(classObj) {
	var value = getClassInput(classObj, 'model_skin_index').val();
	return (value >= 0);
}

function isClassInitAlphaValid(classObj) {
	var value = getClassInput(classObj, 'alpha_initial').val();
	return (value >= 0 && value <= 255);
}

function isClassDamagedAlphaValid(classObj) {
	var value = getClassInput(classObj, 'alpha_damaged').val();
	return (value >= 0 && value <= 255);
}

function isClassDamageValueValid(classObj) {
	var value = getClassInput(classObj, 'alpha_damage').val();
	return (value >= 0 && value <= 20000);
}

function isClassOverlayValid(classObj) {
	return true;
}

function isClassNVGsValid(classObj) {
	return (getClassInput(classObj, 'nvgs').is(':checked'));
}

function isClassFOVValid(classObj) {
	var value = getClassInput(classObj, 'fov').val();
	return (value >= 15 && value <= 165);
}

function isClassNapalmValid(classObj) {
	return (getClassInput(classObj, 'has_napalm').is(':checked'));
}

function isClassBurnTimeValid(classObj) {
	var value = getClassInput(classObj, 'napalm_time').val();
	return (value >= 0 && value <= 600);
}

function isClassImmunityModeValid(classObj) {
	return ($.trim(getClassInput(classObj, 'immunity_mode').val()) !== '');
}

function isClassImmunityAmountValid(classObj) {
	var value = getClassInput(classObj, 'immunity_amount').val();
	return (value >= 0 && value <= 300);
}

function isClassImmunityCooldownValid(classObj) {
	var value = getClassInput(classObj, 'immunity_cooldown').val();
	return (value >= 0 && value <= 300);
}

function isClassNoFallDamageValid(classObj) {
	return (getClassInput(classObj, 'no_fall_damage').is(':checked'));
}

function isClassHealthValid(classObj) {
	var value = getClassInput(classObj, 'health').val();
	return (value >= 0 && value <= 100000);
}

function isClassHPRegenInitValid(classObj) {
	var value = getClassInput(classObj, 'health_regen_interval').val();
	return (value >= 0 && value <= 900);
}

function isClassHPRegenAmountValid(classObj) {
	var value = getClassInput(classObj, 'health_regen_amount').val();
	return (value >= 0 && value <= 10000);
}

function isClassHPInfectGainValid(classObj) {
	var value = getClassInput(classObj, 'health_infect_gain').val();
	return (value >= 0 && value <= 20000);
}

function isClassKillBonusValid(classObj) {
	var value = getClassInput(classObj, 'kill_bonus').val();
	return (value >= 0 && value <= 16);
}

function isClassSpeedValid(classObj) {
	var value = getClassInput(classObj, 'speed').val();
	return (value >= -200 && value <= 2000);
}

function isClassKnockbackValid(classObj) {
	var value = getClassInput(classObj, 'knockback').val();
	return (value >= -30 && value <= 30);
}

function isClassJumpHeightValid(classObj) {
	var value = getClassInput(classObj, 'jump_height').val();
	return (value >= 0 && value <= 5);
}

function isClassJumpDistanceValid(classObj) {
	var value = getClassInput(classObj, 'jump_distance').val();
	return (value >= 0 && value <= 5);
}

/*
 * Verify the common options between zombies and humans, return true if so.
 */
function areCommonOptionsValid(classObj) {
	/* Check each option */
	if (!isClassNameValid(classObj)) {
		return false;
	}

	if (!isClassDescriptionValid(classObj)) {
		return false;
	}

	if (!isClassEnabledValid(classObj)) {
		return false;
	}

	if (!isClassDefaultValid(classObj)) {
		return false;
	}

	if (!isClassFlagsValid(classObj)) {
		return false;
	}

	if (!isClassGroupValid(classObj)) {
		return false;
	}

	if (!isClassModelValid(classObj)) {
		return false;
	}

	if (!isClassModelSkinIndexValid(classObj)) {
		return false;
	}

	console.log('8');

	if (!isClassInitAlphaValid(classObj)) {
		return false;
	}

	if (!isClassDamagedAlphaValid(classObj)) {
		return false;
	}

	if (!isClassDamageValueValid(classObj)) {
		return false;
	}

	if (!isClassOverlayValid(classObj)) {
		return false;
	}

	if (!isClassNVGsValid(classObj)) {
		return false;
	}

	if (!isClassFOVValid(classObj)) {
		return false;
	}

	if (!isClassImmunityModeValid(classObj)) {
		return false;
	}

	if (!isClassImmunityAmountValid(classObj)) {
		return false;
	}

	if (!isClassImmunityCooldownValid(classObj)) {
		return false;
	}

	if (!isClassNoFallDamageValid(classObj)) {
		return false;
	}

	if (!isClassHealthValid(classObj)) {
		return false;
	}

	if (!isClassHPRegenInitValid(classObj)) {
		return false;
	}

	if (!isClassHPRegenAmountValid(classObj)) {
		return false;
	}

	if (!isClassSpeedValid(classObj)) {
		return false;
	}

	if (!isClassJumpHeightValid(classObj)) {
		return false;
	}

	if (!isClassJumpDistanceValid(classObj)) {
		return false;
	}

	/* Finally, we can return true. */
	return true;
}

/*
 * Verify common attributes and zombie-specific ones as well, return true if valid
 */
function isZombieClassValid(classObj) {
	if (!areCommonOptionsValid(classObj)) {
		return false;
	}

	if (!isClassBurnTimeValid(classObj)) {
		return false;
	}

	if (!isClassHPInfectGainValid(classObj)) {
		return false;
	}

	if (!isClassKnockbackValid(classObj)) {
		return false;
	}

	/* Finally, we can return true. */
	return true;
}

/*
 * Verify common attributes and human-specific ones as well, return true if valid
 */
function isHumanClassValid(classObj) {
	if (!areCommonOptionsValid(classObj)) {
		return false;
	}

	if (!isClassNapalmValid(classObj)) {
		return false;
	}

	if (!isClassKillBonusValid(classObj)) {
		return false;
	}

	/* Finally, we can return true. */
	return true;
}

/*
 * Check conditions for creating a new class article
 * Returns boolean value indicating if conditions are met.
 * - Probably not going to be used.
 */

 function canCreateZombieClass() {
 	/* Check if there are any invalid classes before allowing a new one to be made. */
 	$('#zombieClasses article').each(function () {
 		if (!isClassValid(this)) {
 			return false;
 		}
 	});
 	return true;
 }

/**
 * Class label behavior
 */

$('input.className').blur(function (event) {
	/* Get matching name label to this text input */
 	var myNameLabel = $('.classHeader h2').get($(this).index('input.className'));
	myNameLabel.innerHTML = this.value;
	if (isClassNameValid($(myNameLabel).parents('article')[0])) {
		if ($(myNameLabel).hasClass('zombieEmptyClassNameLabel')) {
	 		$(myNameLabel).removeClass('zombieEmptyClassNameLabel');
	 		$(myNameLabel).addClass('zombieClassNameLabel');
	 	} else if ($(myNameLabel).hasClass('humanEmptyClassNameLabel')) {
	 		$(myNameLabel).removeClass('humanEmptyClassNameLabel');
	 		$(myNameLabel).addClass('humanClassNameLabel');
	 	}
 	}
 	else {
 		if ($(myNameLabel).hasClass('zombieClassNameLabel')) {
	 		$(myNameLabel).removeClass('zombieClassNameLabel');
	 		$(myNameLabel).addClass('zombieEmptyClassNameLabel');
	 	} else if ($(myNameLabel).hasClass('humanClassNameLabel')) {
	 		$(myNameLabel).removeClass('humanClassNameLabel');
	 		$(myNameLabel).addClass('humanEmptyClassNameLabel');
	 	}
	 	myNameLabel.innerHTML += ' (blank/duplicate name)';
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

/**
 * Nested accordion
 */

function toggleAccordionElement(targetDiv) {
	if(targetDiv.next().is(':hidden')) {
		targetDiv.next().slideDown();
	} else {
		targetDiv.next().slideUp();
	}
}

$(document).ready(function() {
	parentDivs = $('.accordion div.classContent'),
	childDivs = $('.accordion h3').siblings('div');
	
	$('.accordion h2').click(function(){
		toggleAccordionElement($(this).parent());
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
	createHumanClass();
};
