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

/* For the class name which isn't allowed to have quotes */
function stripQuotes(name) {
	return String(name).replace(/"/g, '');
}

/* Trim and strip quotes */
function formatInputVal(val) {
	return stripQuotes($.trim(val));
}

/* Class input utilities */

function isZombieClass(classObj) {
	return ($(classObj).parents('#zombieClasses').length > 0);
}

function isHumanClass(classObj) {
	return ($(classObj).parents('#humanClasses').length > 0);
}

/* Gets the class object given any element inside it. */
function getClassObjFromElement(element) {
	return $(element).parents('.playerClass')[0];
}

/* Returns the input name given the input and class object
 * Ex: input + classObj->classIndex = 'name' + '3' = 'name3'
 */
function getClassInputName(classObj, input) {
	return input + '_' + $(classObj).data('classIndex');
}

/* Takes a an input element and returns the prefix of the name attribute.  (Inverse of getClassInputName)
 * Ex: class#4 name element ->'name_4' -> 'name'
 */
function getClassInputRawName(classObj, input) {
	var name = $(input).attr('name');
	return name.substr(0, name.lastIndexOf('_'));
}

/* Given the input and class object, returns the jquery selector for the input.
 * Ex: returns 'input[name=name3]' given the input in the previous function's example.
 */
function getClassInputSelector(classObj, input) {
	return 'input[' + 'name=' + getClassInputName(classObj, input) + ']';
}

/**
 * Returns a jquery object containing input elements (only more than one for checkboxes, radio buttons, etc)
 */
function getClassInput(classObj, input) {
	return $(getClassInputSelector(classObj, input), $(classObj));
}

/* Gets the value of a class input
 * Text inputs: string
 * Radio input: selected value
 * Checkbox: jQuery object with checked boxes
 * Number: number
 */
function getClassInputVal(classObj, input) {
	var classInput = getClassInput(classObj, input);
	var classInputType = classInput.attr('type');
	switch(classInputType) {
		case 'text':
			return formatInputVal(classInput.val());
		case 'radio':
			return classInput.filter(':checked').val();
		case 'checkbox':
			return classInput.filter(':checked');
		case 'number':
			return classInput.val();
		default:
			console.log('WARNING: Unknown class input type: ' + classInputType);
	}
}

/* Check if this input has been filled in, checked, or provided a number */
function isClassInputCompleted(classObj, input) {
	var classInput = getClassInput(classObj, input);
	var classInputType = classInput.attr('type');
	switch(classInputType) {
		case 'text':
			return formatInputVal(classInput.val()) !== '';
		case 'radio':
			return classInput.is(':checked');
		case 'checkbox':
			return true;
		case 'number':
			return $.isNumeric(classInput.val());
		default:
			console.log('WARNING: Unknown class input type: ' + classInputType);
	}
}

/* Create a bitfield from a checkbox group.  1 = checked, 0 = unchecked.
 * Example:
 * [ ] Option 1
 * [X] Option 2
 * [X] Option 3
 * ---> 011 = 3
 */
function checkBoxGroupToBitField(classObj, checkboxGroup) {
	var checkBoxes = getClassInput(classObj, checkboxGroup);
	var result = 0;
	checkBoxes.each(function (i, val) {
		if ($(this).is(':checked')) {
			result += Math.pow(2, i);
		}
	});
	return result;
}

/*
 * Global keyvalue tree string builder.
 * Tree format:
 * "node1"
 * {
 *     "node1"
 *     {
 *         "key1"    "value1"
 *         ...
 *     }
 * }
 */
var kvTree = '';
var kvTreeDepth = 0;
var kvIndentString = '    ';

/* For lining up the key values with whitespace */
var kvLongestKeyName = 21; // "health_regen_interval"

/* Clear the global tree to empty. */
function kvClearTree() {
	kvTree = '';
	kvTreeDepth = 0;
}

/* Insert a newline into the tree */
function kvNewLine() {
	kvTree += '\r\n';
}

/* Indent the line based on the current depth of the tree */
function kvIndent() {	
	for (var i = 0; i < kvTreeDepth; i++) {
		kvTree += kvIndentString;
	}
}

/* Add a '//'-formatted comment to the current line */
function kvAddComment(comment) {
	kvIndent();
	kvTree += '// ' + comment;
	kvNewLine();
}

/* Create a node, going 1 level deeper into the tree */
function kvStartNode(name) {
	name = stripQuotes(name);
	kvIndent();
	kvTree += '\"' + name + '\"';
	kvNewLine();
	kvIndent();
	kvTree += '{';
	kvNewLine();
	
	kvTreeDepth++;
}

/* End the node at this level and return back up 1 level in the tree */
function kvEndNode() {
	kvTreeDepth--;
	
	kvIndent();
	kvTree += '}';
	kvNewLine();
}

/* Add a key-value pair to the tree. */
function kvAddKeyValuePair(key, value) {
	key = stripQuotes(key);
	value = stripQuotes(value);
	kvIndent();
	kvTree += '\"' + key + '\"';
	/* Determine spacing */
	for (var i = 0; i < (kvLongestKeyName - key.length) + 1; i++) {
		kvTree += ' ';
	}
	kvTree += '\"' + value + '\"';
	kvNewLine();
}

/**
 * Create/delete class articles
 */

var totalClasses = 0;
var totalZombieClasses = 0;
var totalHumanClasses = 0;

function createZombieClass() {
	/** Clone the template zombie article and change ID */
	var newClass = $('#zombieClassTemplate').clone(true).attr('id', 'zombieClass' + totalClasses).addClass('playerClass').data('classIndex', totalClasses).appendTo('#zombieClasses .accordion');
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
	
	/** Set the default value for 'team_default' input */
	var defaultRadioButtons = getClassInput(newClass, 'team_default');
	defaultRadioButtons.each(function () {
		$(this).prop('checked', (totalHumanClasses == 0 && $(this).val() === 'yes') || (totalHumanClasses > 0 && $(this).val() === 'no'));
	});

	totalClasses++;
	totalZombieClasses++;

	return newClass[0];
}

function createHumanClass() {
	/* Clone the template zombie article and change ID */
	var newClass = $('#humanClassTemplate').clone(true).attr('id', 'humanClass' + totalClasses).addClass('playerClass').data('classIndex', totalClasses).appendTo('#humanClasses .accordion');
	$('input', newClass).each(function () {
		$(this).attr('name', $(this).attr('name').replace('#', totalClasses));
	});

	/* HACK: (described in createZombieClass) */
	var templateRadioButtons = $('input[type=radio]', $('#humanClassTemplate'));
	$('input[type=radio]', newClass).each(function (i, val) {
		if ($(templateRadioButtons[i]).attr('checked')) {
			$(this).prop('checked', false);
			$(this).prop('checked', true);
		}
	});
	
	/** Set the default value for 'team_default' input */
	var defaultRadioButtons = getClassInput(newClass, 'team_default');
	defaultRadioButtons.each(function () {
		$(this).prop('checked', (totalHumanClasses == 0 && $(this).val() === 'yes') || (totalHumanClasses > 0 && $(this).val() === 'no'));
	});
	
	totalClasses++;
	totalHumanClasses++;

	return newClass[0];
}

/* Remove the DOM elements from the page and decrement total classes */
function deleteZombieClass(classObj) {
	$(classObj).remove();
	totalZombieClasses--;
}

/* Remove the DOM elements from the page and decrement total classes */
function deleteHumanClass(classObj) {
	$(classObj).remove();
	totalHumanClasses--;
}

/* Automatically determine if the class is zombie or human and call the appropriate delete function */
function deleteClass(classObj) {
	if (isZombieClass(classObj)) {
		deleteZombieClass(classObj);
	} else if (isHumanClass(classObj)) {
		deleteHumanClass(classObj);
	}
}

/**
 * Class header behavior
 */

function setClassHeaderInvalid(classObj) {
	var classHeader = $('.classHeader h2', classObj);
	if (!classHeader.hasClass('invalidClassHeaderLabel')) {
		classHeader.addClass('invalidClassHeaderLabel');
	}
}

function setClassHeaderValid(classObj) {
	var classHeader = $('.classHeader h2', classObj);
	if (classHeader.hasClass('invalidClassHeaderLabel')) {
		classHeader.removeClass('invalidClassHeaderLabel');
	}
}

function updateHeaderStyle(classObj, valid) {
	if (valid) {
		setClassHeaderValid(classObj);
	} else {
		setClassHeaderInvalid(classObj);
	}
}

function setHeaderText(classObj, text) {
	$('.classHeader h2', classObj).html(stripQuotes(text));
}

function updateHeaderText(classObj) {
	var headerText = '';
	
	if (isClassInputCompleted(classObj, 'name')) {
		headerText += getClassInputVal(classObj, 'name');
	} else {
		headerText += '(Unnamed)';
	}
	
	setHeaderText(classObj, headerText);
}

/* Config option validation functions */

function isClassNameUnique(classObj) {
	/** Check if the value of the class name input conflicts with any other classes. */
	var conflict = false;
	var className = formatInputVal(getClassInputVal(classObj, 'name'));
	$('.playerClass').each(function () {
		if (classObj === this) {
			return false;
		}
		
		if (getClassInput(this, 'name').data('nameValid')) {
			if (className.toLowerCase() === formatInputVal(getClassInputVal(this, 'name')).toLowerCase()) {
				conflict = true;
				return false; /* Break the loop */
			}
		}
	});
	return !conflict;
}

/* Checks if this is the only default class SO FAR.  Only the first defaulted class on a team is valid */
function isOnlyDefaultClass(classObj) {
	if (getClassInputVal(classObj, 'team_default') === 'yes') {
		var conflict = false;
		if (isZombieClass(classObj)) {
			$('#zombieClasses .playerClass').each(function () {
				if (classObj === this) {
					return false;
				}
				
				if (getClassInputVal(this, 'team_default') === 'yes') {
					conflict = true;
					return false;
				}
			});
		}
		else if (isHumanClass(classObj)) {
			$('#humanClasses .playerClass').each(function () {
				if (classObj === this) {
					return false;
				}
				
				if (getClassInputVal(this, 'team_default')) {
					conflict = true;
					return false;
				}
			});
		}
		return !conflict;
	}
	return true;
}

function setInputErrorTextVisible(input, visible) {
	var error = $(input).parents('.option').children('.optionError');
	if (error.is(':hidden') === visible) {
		error.toggle('slide', 500);
	}
}

function updateErrorBoxErrors(errorBox, fErrors) {
	$('.sectionContent li', errorBox).each(function (i, val) {
		$(val).toggle(Boolean((1 << i) & fErrors));
	});
}

function setZombieTeamErrorBoxVisible(visible, fErrors) {
	var errorBox = $('#zombieClasses .teamErrors');
	if (visible) {
		updateErrorBoxErrors(errorBox, fErrors);
	}
	
	if (visible && errorBox.is(':hidden')) {
		errorBox.slideDown(400);
	} else if (!visible && !errorBox.is(':hidden')) {
		errorBox.slideUp(400);
	}
}

function setHumanTeamErrorBoxVisible(visible, fErrors) {
	var errorBox = $('#humanClasses .teamErrors');
	if (visible) {
		updateErrorBoxErrors(errorBox, fErrors);
	}
	
	if (visible && errorBox.is(':hidden')) {
		errorBox.slideDown(400);
	} else if (!visible && !errorBox.is(':hidden')) {
		errorBox.slideUp(400);
	}
}

function isClassNameValid(classObj) {
	var input = getClassInput(classObj, 'name');
	var valid = isClassInputCompleted(classObj, 'name') && isClassNameUnique(classObj);
	getClassInput(classObj, 'name').data('nameValid', valid);
	return valid;
}

function isClassDescriptionValid(classObj) {
	return isClassInputCompleted(classObj, 'description');
}

function isClassEnabledValid(classObj) {
	return isClassInputCompleted(classObj, 'enabled');
}

function isClassTeamDefaultValid(classObj) {
	return (isClassInputCompleted(classObj, 'team_default') && isOnlyDefaultClass(classObj));
}

function isClassFlagsValid(classObj) {
	return isClassInputCompleted(classObj, 'flags');
}

function isClassGroupValid(classObj) {
	return true;
}

function isClassModelValid(classObj) {
	return isClassInputCompleted(classObj, 'model_path');
}

function isClassModelSkinIndexValid(classObj) {
	var value = getClassInputVal(classObj, 'model_skin_index');
	return (isClassInputCompleted(classObj, 'model_skin_index') && value >= 0);
}

function isClassAlphaInitialValid(classObj) {
	var value = getClassInputVal(classObj, 'alpha_initial');
	return (isClassInputCompleted(classObj, 'alpha_initial') && value >= 0 && value <= 255);
}

function isClassAlphaDamagedValid(classObj) {
	var value = getClassInputVal(classObj, 'alpha_damaged');
	return (isClassInputCompleted(classObj, 'alpha_damaged') && value >= 0 && value <= 255);
}

function isClassAlphaDamageValid(classObj) {
	var value = getClassInputVal(classObj, 'alpha_damage');
	return (isClassInputCompleted(classObj, 'alpha_damage') && value >= 0 && value <= 20000);
}

function isClassOverlayValid(classObj) {
	return true;
}

function isClassNVGsValid(classObj) {
	return isClassInputCompleted(classObj, 'nvgs');
}

function isClassFOVValid(classObj) {
	var value = getClassInputVal(classObj, 'fov');
	return (isClassInputCompleted(classObj, 'fov') && value >= 15 && value <= 165);
}

function isClassNapalmValid(classObj) {
	return isClassInputCompleted(classObj, 'has_napalm');
}

function isClassBurnTimeValid(classObj) {
	var value = getClassInputVal(classObj, 'napalm_time');
	return (isClassInputCompleted(classObj, 'napalm_time') && value >= 0 && value <= 600);
}

function isClassImmunityModeValid(classObj) {
	return isClassInputCompleted(classObj, 'immunity_mode');
}

function isClassImmunityAmountValid(classObj) {
	var value = getClassInputVal(classObj, 'immunity_amount');
	return (isClassInputCompleted(classObj, 'immunity_amount') && value >= 0 && value <= 300);
}

function isClassImmunityCooldownValid(classObj) {
	var value = getClassInputVal(classObj, 'immunity_cooldown');
	return (isClassInputCompleted(classObj, 'immunity_cooldown') && value >= 0 && value <= 300);
}

function isClassNoFallDamageValid(classObj) {
	return isClassInputCompleted(classObj, 'no_fall_damage');
}

function isClassHealthValid(classObj) {
	var value = getClassInputVal(classObj, 'health');
	return (isClassInputCompleted(classObj, 'health') && value >= 0 && value <= 100000);
}

function isClassHealthRegenIntervalValid(classObj) {
	var value = getClassInputVal(classObj, 'health_regen_interval');
	return (isClassInputCompleted(classObj, 'health_regen_interval') && value >= 0 && value <= 900);
}

function isClassHealthRegenAmountValid(classObj) {
	var value = getClassInputVal(classObj, 'health_regen_amount');
	return (isClassInputCompleted(classObj, 'health_regen_amount') && value >= 0 && value <= 10000);
}

function isClassHealthInfectGainValid(classObj) {
	var value = getClassInputVal(classObj, 'health_infect_gain');
	return (isClassInputCompleted(classObj, 'health_infect_gain') && value >= 0 && value <= 20000);
}

function isClassKillBonusValid(classObj) {
	var value = getClassInputVal(classObj, 'kill_bonus');
	return (isClassInputCompleted(classObj, 'kill_bonus') && value >= 0 && value <= 16);
}

function isClassSpeedValid(classObj) {
	var value = getClassInputVal(classObj, 'speed');
	return (isClassInputCompleted(classObj, 'speed') && value >= -200 && value <= 2000);
}

function isClassKnockbackValid(classObj) {
	var value = getClassInputVal(classObj, 'knockback');
	return (isClassInputCompleted(classObj, 'knockback') && value >= -30 && value <= 30);
}

function isClassJumpHeightValid(classObj) {
	var value = getClassInputVal(classObj, 'jump_height');
	return (isClassInputCompleted(classObj, 'jump_height') && value >= 0 && value <= 5);
}

function isClassJumpDistanceValid(classObj) {
	var value = getClassInputVal(classObj, 'jump_distance');
	return (isClassInputCompleted(classObj, 'jump_distance') && value >= 0 && value <= 5);
}

/* A class is a default class if it's enabled, public, and default */
function isClassDefault(classObj) {
	return (getClassInputVal(classObj, 'enabled') === 'yes' && getClassInputVal(classObj, 'group') === '' && getClassInputVal(classObj, 'team_default') === 'yes');
}

/*
 * Maps of common, zombie, and human validator functions (mapping input name to function)
 */

common_validators =
{
	'name' : isClassNameValid,
	'description' : isClassDescriptionValid,
	'enabled' : isClassEnabledValid,
	'team_default': isClassTeamDefaultValid,
	'flags': isClassFlagsValid,
	'group': isClassGroupValid,
	'model_path': isClassModelValid,
	'model_skin_index': isClassModelSkinIndexValid,
	'alpha_initial': isClassAlphaInitialValid,
	'alpha_damaged' : isClassAlphaDamagedValid,
	'alpha_damage' : isClassAlphaDamageValid,
	'overlay_path' : isClassOverlayValid,
	'nvgs' : isClassNVGsValid,
	'fov' : isClassFOVValid,
	'immunity_mode' : isClassImmunityModeValid,
	'immunity_amount' : isClassImmunityAmountValid,
	'immunity_cooldown' : isClassImmunityCooldownValid,
	'no_fall_damage' : isClassNoFallDamageValid,
	'health' : isClassHealthValid,
	'health_regen_interval' : isClassHealthRegenIntervalValid,
	'health_regen_amount' : isClassHealthRegenAmountValid,
	'speed' : isClassSpeedValid,
	'jump_height' : isClassJumpHeightValid,
	'jump_distance' : isClassJumpDistanceValid
};

zombie_validators = {
	'napalm_time' : isClassBurnTimeValid,
	'health_infect_gain' : isClassHealthInfectGainValid,
	'kill_bonus' : isClassKillBonusValid,
	'knockback' : isClassKnockbackValid
};

human_validators = {
	'has_napalm' : isClassNapalmValid
};

all_validators = {};
$.extend(all_validators, common_validators, zombie_validators, human_validators);

/* Validate a single class input */
function validateInputElement(classObj, inputName) {
	var invalid = !(all_validators[inputName])(classObj);
	setInputErrorTextVisible(getClassInput(classObj, inputName), invalid);
	return !invalid;
}

/* Highlight errors in class by collapsing errorless sections and expanding errored ones. */
function highlightErrors(classObj) {
	var valid;
	$('.classSection', classObj).each(function (i, classSection) {
		valid = true;
		$('input', classSection).each(function (j, input) {
			valid = (all_validators[getClassInputRawName(classObj, input)])(classObj);
			if (!valid) {
				return false;
			}
		});
		valid ? collapseSection(classSection, 400) : expandSection(classSection, 400);
	});
}

/*
 * Run the validation functions on this class depending on team, return true if valid.
 */
function validateClass(classObj) {
	/* Object to hold validators for this team. */
	var validators = new Object();
	
	/* Extend the validators object to hold validator functions for the appropriate team */
	if (isZombieClass(classObj)) {
		 $.extend(validators, common_validators, zombie_validators);
	} else if (isHumanClass(classObj)) {
		 $.extend(validators, common_validators, human_validators);
	}

	/* Validate */
	var valid = true;
	$.each(validators, function (inputName, validator) {
		var invalid = !(validator)(classObj);
		setInputErrorTextVisible(getClassInput(classObj, inputName), invalid);
		if (invalid) {
			valid = false;
		}
	});
	
	/* Cache the result of this validation */
	$(classObj).data('valid', valid);
	
	/* Update header */
	updateHeaderStyle(classObj, valid);
	updateHeaderText(classObj);
	
	/* Change outline to error red if invalid */
	$(classObj).attr('style', valid ? '' : 'border: 1px solid #cc0000');
	
	/* Slide up if valid, slide down if invalid */
	valid ? collapseClass(classObj, 400) : expandClass(classObj, 400);
	
	/* Highlight errors */
	if (!valid) {
		highlightErrors(classObj);
	}
	
	return valid;
}

/* Error flags */
var ERROR_NO_DEFAULT_CLASS = 0x01;
var ERROR_INVALID_CLASSES = 0x02;

function validateClasses() {
	/* Count valid/invalid classes on each team */
	var invalidZombieClasses = 0;
	var invalidHumanClasses = 0;
	var hasDefaultZombieClass = false;
	var hasDefaultHumanClass = false;
	$('.playerClass').each(function () {
		if (!validateClass(this)) {
			if (isZombieClass(this)) {
				invalidZombieClasses++;
			} else if (isHumanClass(this)) {
				invalidHumanClasses++;
			}
		} else if (isClassDefault(this)) { /* This class is valid, so now check if it can be a default class */
			if (isZombieClass(this)) {
				hasDefaultZombieClass = true;
			} else if (isHumanClass(this)) {
				hasDefaultHumanClass = true;
			}
		}
	});
	
	/* Variables to hold a bit field of errors for each team.  Each bit corresponds to the index of the <li> element in the 'Errors' box. */
	var fZombieErrors = 0;
	var fHumanErrors = 0;
	
	/* Read data and set error bits */
	if (invalidZombieClasses > 0) {
		fZombieErrors |= ERROR_INVALID_CLASSES;
	}
	
	if (invalidHumanClasses > 0) {
		fHumanErrors |= ERROR_INVALID_CLASSES;
	}
	
	if (!hasDefaultZombieClass) {
		fZombieErrors |= ERROR_NO_DEFAULT_CLASS;
	}
	
	if (!hasDefaultHumanClass) {
		fHumanErrors |= ERROR_NO_DEFAULT_CLASS;
	}
	
	/* Display or hide the error box */
	setZombieTeamErrorBoxVisible((fZombieErrors > 0), fZombieErrors);
	setHumanTeamErrorBoxVisible((fHumanErrors > 0), fHumanErrors);
	
	return (fZombieErrors == 0 && fHumanErrors == 0);
}

/* Update header when any input is touched */
$('input.className').keyup(function (event) {
	var classObj = getClassObjFromElement(this);
	updateHeaderText(classObj);
});

$('input').blur(function (event) {
	var classObj = getClassObjFromElement(this);
	validateInputElement(classObj, getClassInputRawName(classObj, this));
});

/* Read each input and format it for ZR playerclasses.txt. */
function inputToFile()
{
	kvClearTree();
	kvAddComment('============================================================================');
	kvAddComment('');
	kvAddComment('                   Zombie:Reloaded Class configuration');
	kvAddComment('');
	kvAddComment('See Class Configuration (3.7) in the manual for detailed info.');
	kvAddComment('');
	kvAddComment('============================================================================');
	kvAddComment('');
	kvAddComment('SHORT DESCRIPTIONS');
	kvAddComment('');
	kvAddComment('Attribute:               Values:     Description:');
	kvAddComment('----------------------------------------------------------------------------');
	kvAddComment('enabled                  yes/no      Enables or disables a class.');
	kvAddComment('team                     number      Specifies what team the class belongs to:');
	kvAddComment('                                     0 - Zombies');
	kvAddComment('                                     1 - Humans');
	kvAddComment('                                     2 - Admin mode classes (incomplete feautre!)');
	kvAddComment('team_default             yes/no      Marks the class as the default class in the team.');
	kvAddComment('flags                    number      Special class flags (bit field). To combine multiple flags use a sum of the flag values. Available flags:');
	kvAddComment('                                     1 - Admins only');
	kvAddComment('                                     2 - Mother zombies only');
	kvAddComment('group                    text        Restrict class to member of this SourceMod group. Leave blank for no restriction.');
	kvAddComment('name                     text        The class name used in class menu.');
	kvAddComment('description              text        The class description used in class menu.');
	kvAddComment('model_path               text        Path to model to use. Relative to cstrike folder.');
	kvAddComment('model_skin_index         number      Model skin index to use if model support multiple skins. First skin is 0.');
	kvAddComment('alpha_initial            number      Initial transparency setting.');
	kvAddComment('alpha_damaged            number      Transparency when damaged.');
	kvAddComment('alpha_damage             number      How much damage to do before switching alpha.');
	kvAddComment('overlay_path             text        Overlay displayed at the player.');
	kvAddComment('nvgs                     yes/no      Give and turn on night vision.');
	kvAddComment('fov                      number      Field of view value. 90 is default.');
	kvAddComment('has_napalm               yes/no      Allows player to throw napalm grenades. Humans only.');
	kvAddComment('napalm_time              decimal     Napalm burn duration. Zombies only.');
	kvAddComment('immunity_mode            text        Special immunity modes. Some modes only works on humans or zombies:');
	kvAddComment('                                     "none"   - Instant infection.');
	kvAddComment('                                     "kill"   - Humans are instantly killed instead of turning zombies when attacked by zombies.');
	kvAddComment('                                     "full"   - Completely immune. Humans can\'t be infected, zombies don\'t receive damage or knock back. Careful with this, it might not be that fun.');
	kvAddComment('                                     "infect" - Humans are immune to infections until HP go below a threshold. Threshold at zero enable stabbing to death.');
	kvAddComment('                                     "damage" - Zombies are immune to damage from humans/grenades, but still vulnerable to knock back.');
	kvAddComment('                                     "delay"  - Delay infection for a certain number of seconds.');
	kvAddComment('                                     "shield" - Shield against infections (humans) or knock back (zombies) for a certain amount of seconds (similar to TF2\'s übercharge). Deploy with "zshield" command.');
	kvAddComment('immunity_amount          number      Immunity data value (humans only). Depends on the immunity mode above:');
	kvAddComment('                                     "infect" - HP threshold. Infection will be allowed when HP go below this value. Zero will enable stabbing to death.');
	kvAddComment('                                     "delay"  - Number of seconds the infection is delayed since first hit by a zombie.');
	kvAddComment('                                     "shield" - Number of seconds the shield is active.');
	kvAddComment('immunity_cooldown        number      Number of seconds of cooldown for temporary immunity actions, depending on mode.');
	kvAddComment('                                     "delay"  - Number of seconds the delay is reduced every time a zombie attack, while a delayed infection is in progress.');
	kvAddComment('                                     "shield" - Number of seconds the player has to wait before the shield can be used again.');
	kvAddComment('no_fall_damage           on/off      Disables fall damage.');
	kvAddComment('health                   number      How many health points to give.');
	kvAddComment('health_regen_interval    decimal     Sets the regeneration interval. 0 to disable.');
	kvAddComment('health_regen_amount      number      How much HP to give per interval.');
	kvAddComment('health_infect_gain       number      How much HP to give when the player infects someone. Zombies only.');
	kvAddComment('kill_bonus               number      How many points to give per kill. Zombies only.');
	kvAddComment('speed                    decimal     The player speed. In LMV mode 300 is normal speed, 600 is double speed.');
	kvAddComment('knockback                decimal     Force of the knockback when shot at. Zombies only.');
	kvAddComment('jump_height              decimal     Multiplier of the players jump height. 0.0 means no jump boost, 1.0 is normal.');
	kvAddComment('jump_distance            decimal     Multiplier of the players jump distance. 0.0 means no forward jump boost, 1.0 is normal.');
	kvNewLine();
	
	kvStartNode('classes');
	kvAddComment('------------------------------------------');
	kvAddComment('');
	kvAddComment('Zombie classes');
	kvAddComment('');
	kvAddComment('------------------------------------------');
	$('#zombieClasses .playerClass').each(function () {
		kvStartNode(getClassInput(this, 'name').val());
		kvAddComment('General');
		kvAddKeyValuePair('enabled', getClassInput(this, 'enabled').filter(':checked').val());
		kvAddKeyValuePair('team', '0');
		kvAddKeyValuePair('team_default', getClassInput(this, 'team_default').filter(':checked').val());
		kvAddKeyValuePair('flags', checkBoxGroupToBitField(this, 'flags'));
		kvAddKeyValuePair('group', getClassInput(this, 'group').val());
		kvNewLine();
		kvAddKeyValuePair('name', getClassInput(this, 'name').val());
		kvAddKeyValuePair('description', getClassInput(this, 'description').val());
		kvNewLine();
		kvAddComment('Model');
		kvAddKeyValuePair('model_path', getClassInput(this, 'model_path').val());
		kvAddKeyValuePair('model_skin_index', getClassInput(this, 'model_skin_index').val());
		kvAddKeyValuePair('alpha_initial', getClassInput(this, 'alpha_initial').val());
		kvAddKeyValuePair('alpha_damaged', getClassInput(this, 'alpha_damaged').val());
		kvAddKeyValuePair('alpha_damage', getClassInput(this, 'alpha_damage').val());
		kvNewLine();
		kvAddComment('Hud');
		kvAddKeyValuePair('overlay_path', getClassInput(this, 'overlay_path').val());
		kvAddKeyValuePair('nvgs', getClassInput(this, 'nvgs').filter(':checked').val());
		kvAddKeyValuePair('fov', getClassInput(this, 'fov').val());
		kvNewLine();
		kvAddComment('Effects');
		kvAddKeyValuePair('has_napalm', 'no');
		kvAddKeyValuePair('napalm_time', getClassInput(this, 'napalm_time').val());
		kvNewLine();
		kvAddComment('Player behavior');
		kvAddKeyValuePair('immunity_mode', getClassInput(this, 'immunity_mode').val());
		kvAddKeyValuePair('immunity_amount', getClassInput(this, 'immunity_amount').val());
		kvAddKeyValuePair('immunity_cooldown', getClassInput(this, 'immunity_cooldown').val());
		kvAddKeyValuePair('no_fall_damage', getClassInput(this, 'no_fall_damage').filter(':checked').val());
		kvNewLine();
		kvAddKeyValuePair('health', getClassInput(this, 'health').val());
		kvAddKeyValuePair('health_regen_interval', getClassInput(this, 'health_regen_interval').val());
		kvAddKeyValuePair('health_regen_amount', getClassInput(this, 'health_regen_amount').val());
		kvAddKeyValuePair('health_infect_gain', getClassInput(this, 'health_infect_gain').val());
		kvAddKeyValuePair('kill_bonus', getClassInput(this, 'kill_bonus').val());
		kvNewLine();
		kvAddKeyValuePair('speed', getClassInput(this, 'speed').val());
		kvAddKeyValuePair('knockback', getClassInput(this, 'knockback').val());
		kvAddKeyValuePair('jump_height', getClassInput(this, 'jump_height').val());
		kvAddKeyValuePair('jump_distance', getClassInput(this, 'jump_distance').val());
		kvEndNode();
	});
	kvNewLine();
	kvAddComment('------------------------------------------');
	kvAddComment('');
	kvAddComment('Human classes');
	kvAddComment('');
	kvAddComment('------------------------------------------');
	kvNewLine();
	$('#humanClasses .playerClass').each(function () {
		kvStartNode(getClassInput(this, 'name').val());
		kvAddComment('General');
		kvAddKeyValuePair('enabled', getClassInput(this, 'enabled').filter(':checked').val());
		kvAddKeyValuePair('team', '1');
		kvAddKeyValuePair('team_default', getClassInput(this, 'team_default').filter(':checked').val());
		kvAddKeyValuePair('flags', checkBoxGroupToBitField(this, 'flags'));
		kvAddKeyValuePair('group', getClassInput(this, 'group').val());
		kvNewLine();
		kvAddKeyValuePair('name', getClassInput(this, 'name').val());
		kvAddKeyValuePair('description', getClassInput(this, 'description').val());
		kvNewLine();
		kvAddComment('Model');
		kvAddKeyValuePair('model_path', getClassInput(this, 'model_path').val());
		kvAddKeyValuePair('model_skin_index', getClassInput(this, 'model_skin_index').val());
		kvAddKeyValuePair('alpha_initial', getClassInput(this, 'alpha_initial').val());
		kvAddKeyValuePair('alpha_damaged', getClassInput(this, 'alpha_damaged').val());
		kvAddKeyValuePair('alpha_damage', getClassInput(this, 'alpha_damage').val());
		kvNewLine();
		kvAddComment('Hud');
		kvAddKeyValuePair('overlay_path', getClassInput(this, 'overlay_path').val());
		kvAddKeyValuePair('nvgs', getClassInput(this, 'nvgs').filter(':checked').val());
		kvAddKeyValuePair('fov', getClassInput(this, 'fov').val());
		kvNewLine();
		kvAddComment('Effects');
		kvAddKeyValuePair('has_napalm', getClassInput(this, 'has_napalm').filter(':checked').val());
		kvAddKeyValuePair('napalm_time', '0');
		kvNewLine();
		kvAddComment('Player behavior');
		kvAddKeyValuePair('immunity_mode', getClassInput(this, 'immunity_mode').val());
		kvAddKeyValuePair('immunity_amount', getClassInput(this, 'immunity_amount').val());
		kvAddKeyValuePair('immunity_cooldown', getClassInput(this, 'immunity_cooldown').val());
		kvAddKeyValuePair('no_fall_damage', getClassInput(this, 'no_fall_damage').filter(':checked').val());
		kvNewLine();
		kvAddKeyValuePair('health', getClassInput(this, 'health').val());
		kvAddKeyValuePair('health_regen_interval', getClassInput(this, 'health_regen_interval').val());
		kvAddKeyValuePair('health_regen_amount', getClassInput(this, 'health_regen_amount').val());
		kvAddKeyValuePair('health_infect_gain', '0');
		kvAddKeyValuePair('kill_bonus', '0');
		kvNewLine();
		kvAddKeyValuePair('speed', getClassInput(this, 'speed').val());
		kvAddKeyValuePair('knockback', '0');
		kvAddKeyValuePair('jump_height', getClassInput(this, 'jump_height').val());
		kvAddKeyValuePair('jump_distance', getClassInput(this, 'jump_distance').val());
		kvEndNode();
	});
	kvEndNode();
	saveAs(new window.Blob([kvTree], {type: "text/plain;charset=" + document.characterSet}), ('playerclasses.txt'));
}


/*
 * Button listeners
 */

$('#zombieClasses .addClassButton').click(function (event) {
	if (totalClasses < 64) {
		var newClass = createZombieClass();
		collapseClass(newClass, 0);
		expandClass(newClass, 400);
	}
});

$('#humanClasses .addClassButton').click(function (event) {
	if (totalClasses < 64) {
		var newClass = createHumanClass();
		collapseClass(newClass, 0);
		expandClass(newClass, 400);
	}
});

$('img.deleteClassButton').click( function (event) {
	var classObj = getClassObjFromElement(this);
	$(classObj).hide('blind', 400, function () {
		deleteClass(classObj);
	});
	
	/* Block the default a tag behavior */
	event.preventDefault();
});

/* Called by generate config button */
function generateConfig() {
	if (validateClasses()) {
		inputToFile();
	}
}

/*
 * Accordion
 */

function expandClass(classObj, duration) {
	$(classObj).children('.classContent').slideDown(duration);
}

function collapseClass(classObj, duration) {
	$(classObj).children('.classContent').slideUp(duration);
}

function expandSection(sectionObj, duration) {
	$(sectionObj).slideDown(duration);
}

function collapseSection(sectionObj, duration) {
	$(sectionObj).slideUp(duration);
}

function toggleAccordionElement(targetDiv) {
	if(targetDiv.is(':hidden')) {
		targetDiv.slideDown();
	} else {
		targetDiv.slideUp();
	}
}

function initAccordions() {
	$('.accordion h2').click(function(){
		toggleAccordionElement($(this).parents('.sectionHeader').siblings('.sectionContent'));
	});
	$('.accordion h3').click(function(){
		toggleAccordionElement($(this).next('.classSection'));
	});
}

/* Page loaded listener */
$(document).ready(function() {
	/* Initialize accordion structure. */
	initAccordions();
	
	/* Create one of each class when the page loads */
	createZombieClass();
	createHumanClass();
	
	/* Testing */
});
