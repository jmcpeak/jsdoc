/**
	@overview
	@author Michael Mathews <micmath@gmail.com>
	@license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

/**
	Create tag objects.
	@module jsdoc/tag
 */
(function() {
	var jsdoc_type = require('jsdoc/type');
	
	exports.fromCommentText = function(commentText) {
		var tag,
			tags = [];

		// split out the basic tags
		commentText
		.split(/(^|[\r\n])\s*@/)
		.filter( function($){ return $.match(/\S/); } )
		.forEach(function($) {
			tag = fromTagText($);

			if (tag.name) {
				tags.push(tag);
			}
			else {
				// TODO: warn about tag with no name?
			}
		});
		
		return tags;
	}
	
	exports.fromTagText = function(tagText) {
		return new Tag(tagText);
	}
	
	var longTags = ['param', 'constructor', 'const', 'module', 'event', 'namespace', 'method', 'member', 'function', 'variable', 'enum'];
	/**
		@private
		@constructor Tag
		@param {string} tagText
	 */
	function Tag(tagText) {
		this.raw = tagText;
		this.name = '';
		this.type = [];
		this.text = '';
		this.pname = '';
		this.pdesc = '';
		
		// tagText is like: "tagname tag text"
		var bits = tagText.match(/^(\S+)(?:\s+([\s\S]*))?$/);
	
		if (bits) {
			this.name = (bits[1] || '').toLowerCase(); // like @name
			this.name = synonym(this.name);
			
			this.text = bits[2] || ''; // all the rest of the tag
			
			var type, text, optional, nullable;
			[type, text, optional, nullable] = jsdoc_type.parse(this.text);
			
			// @type tags are the only tag that is not allowed to have a {type}!
			if (this.name === 'type') {
				text = text || type.join('|');
				type = [];
			}
			
			if (type && type.length) {
				this.type = type;
			}
			if (optional !== null) { this.poptional = optional; }
			if (nullable !== null) { this.pnullable = nullable; }
			
			this.text = text;
			if (longTags.indexOf(this.name) > -1) { // is a tag that uses the long format
				var [pname, pdesc] = parsePname(this.text);
				this.pname = pname;
				this.pdesc = pdesc;
			}
		}
	}
	
	Tag.prototype.toString = function() {
		return '@'+this.raw;
	}
	
	/**
		Split the parameter name and parameter desc from the tag text.
		@private
		@method parsePname
		@param {string} tagText
		@returns Array.<string> The pname and the pdesc.
	 */
	function parsePname(tagText) {
		tagText.match(/^(\S+)(\s+(\S.*))?$/);
		
		return [RegExp.$1, RegExp.$3];
	}
	
	function synonym(name) {
		if ( synonym.map.hasOwnProperty(name) ) {
			return synonym.map[name];
		}
		else {
			return name;
		}
	}
	synonym.map = {
		'description': 'desc',
		'function': 'method',
		'variable': 'member'
	}
	
})();