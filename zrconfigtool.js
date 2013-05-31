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

/*
 * KV tree string builder.
 */
var kvTree = '';
var kvTreeDepth = 0;

/* For lining up the key values */
var kvLongestKeyName = 21; // "health_regen_interval"

function kvClearTree() {
	kvTree = '';
	kvTreeDepth = 0;
}

/* Insert tabs based on the depth of the tree. */
function kvNewLine() {
	kvTree += '\r\n';
}

function kvIndent() {	
	for (var i = 0; i < kvTreeDepth; i++) {
		kvTree += '    ';
	}
}

function kvAddComment(comment) {
	kvIndent();
	kvTree += '// ' + comment;
	kvNewLine();
}

function kvStartNode(name) {
	kvIndent();
	kvTree += '\"' + name + '\"';
	kvNewLine();
	kvIndent();
	kvTree += '{';
	kvNewLine();
	
	kvTreeDepth++;
}

function kvEndNode() {
	kvTreeDepth--;
	
	kvIndent();
	kvTree += '}';
	kvNewLine();
}

function kvAddKeyValuePair(key, value) {
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
	** Clone the template zombie article and change ID */
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
	$('.playerClass').each(function () {
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

	if (!isClassKillBonusValid(classObj)) {
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

	/* Finally, we can return true. */
	return true;
}

/**
 * Class label behavior
 */

$('input.className').blur(function (event) {
	/* Get matching name label to this text input */
 	var myNameLabel = $('.classHeader h2').get($(this).index('input.className'));
	myNameLabel.innerHTML = this.value;
	if (isClassNameValid($(myNameLabel).parents('.playerClass')[0])) {
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

/**
 * Generate KV tree
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
	deleteZombieClass($(this).parents('.playerClass')[0]);
	event.preventDefault();
});

$('#humanClasses img.deleteClassButton').click( function (event) {
	deleteHumanClass($(this).parents('.playerClass')[0]);
	event.preventDefault();
});

/* Called by generate config button */
function generateConfig() {
	inputToFile();
}

/*
 * Accordion
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
	
	/* Create one of each class when the page loads */
	createZombieClass();
	createHumanClass();
});
