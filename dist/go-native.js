(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.gn = global.gn || {})));
}(this, (function (exports) { 'use strict';

function isNodeList(el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== "undefined";
}

function append(els, data) {
  var els_new = isNodeList(els) ? els : [els],
      i;

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (i = els_new.length; i--;) {
      els_new[i].appendChild(data);
    }
  } else if (typeof data === "string") {
    for (i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML("beforeend", data);
    }
  } else if (isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].appendChild(fragment);
    }
  }
}

function createElement(obj) {
  if (!obj || !obj.tagName) {
    throw { message: "Invalid argument" };
  }

  var el = document.createElement(obj.tagName);
  obj.id && (el.id = obj.id);
  obj.className && (el.className = obj.className);
  obj.html && (el.innerHTML = obj.html);

  if (typeof obj.attributes !== "undefined") {
    var attr = obj.attributes,
        prop;

    for (prop in attr) {
      if (attr.hasOwnProperty(prop)) {
        el.setAttribute(prop, attr[prop]);
      }
    }
  }

  if (typeof obj.children !== "undefined") {
    var i = 0,
        len = obj.children.length;

    while (i < len) {
      el.appendChild(createElement(obj.children[i]));
      i++;
    }
  }

  return el;
}

// var el = gn.createElement({
//  tagName: "div",
//  id: "foo",
//  className: "foo",
//  children: [{
//    tagName: "div",
//    html: "<b>Hello, creatElement</b>",
//    attributes: {
//      "am-button": "primary"
//    }
//  }]
// });

function ready(fn) {
  // Sanity check
  if (typeof fn !== "function") {
    return;
  }

  // If document is already loaded, run method
  if (document.readyState === "complete") {
    return fn();
  }

  // Otherwise, wait until document is loaded
  document.addEventListener("DOMContentLoaded", fn, false);
}

function extend() {
  var obj,
      name,
      copy,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length;

  for (; i < length; i++) {
    if ((obj = arguments[i]) !== null) {
      for (name in obj) {
        copy = obj[name];

        if (target === copy) {
          continue;
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}

/** DOMTokenList polyfill */
(function () {
	"use strict";

	/*<*/

	var UNDEF,
	    WIN = window,
	    DOC = document,
	    OBJ = Object,
	    NULL = null,
	    TRUE = true,
	    FALSE = false,

	/*>*/

	/** Munge the hell out of our string literals. Saves a tonne of space after compression. */
	SPACE = " ",
	    ELEMENT = "Element",
	    CREATE_ELEMENT = "create" + ELEMENT,
	    DOM_TOKEN_LIST = "DOMTokenList",
	    DEFINE_GETTER = "__defineGetter__",
	    DEFINE_PROPERTY = "defineProperty",
	    CLASS_ = "class",
	    LIST = "List",
	    CLASS_LIST = CLASS_ + LIST,
	    REL = "rel",
	    REL_LIST = REL + LIST,
	    DIV = "div",
	    LENGTH = "length",
	    CONTAINS = "contains",
	    APPLY = "apply",
	    HTML_ = "HTML",
	    METHODS = ("item " + CONTAINS + " add remove toggle toString toLocaleString").split(SPACE),
	    ADD = METHODS[2],
	    REMOVE = METHODS[3],
	    TOGGLE = METHODS[4],
	    PROTOTYPE = "prototype",


	/** Ascertain browser support for Object.defineProperty */
	dpSupport = DEFINE_PROPERTY in OBJ || DEFINE_GETTER in OBJ[PROTOTYPE] || NULL,


	/** Wrapper for Object.defineProperty that falls back to using the legacy __defineGetter__ method if available. */
	defineGetter = function defineGetter(object, name, fn, configurable) {
		if (OBJ[DEFINE_PROPERTY]) OBJ[DEFINE_PROPERTY](object, name, {
			configurable: FALSE === dpSupport ? TRUE : !!configurable,
			get: fn
		});else object[DEFINE_GETTER](name, fn);
	},


	/** DOMTokenList interface replacement */
	DOMTokenList = function DOMTokenList(el, prop) {
		var THIS = this,


		/** Private variables */
		tokens = [],
		    tokenMap = {},
		    length = 0,
		    maxLength = 0,
		    reindex = function reindex() {

			/** Define getter functions for array-like access to the tokenList's contents. */
			if (length >= maxLength) for (; maxLength < length; ++maxLength) {
				(function (i) {

					defineGetter(THIS, i, function () {
						preop();
						return tokens[i];
					}, FALSE);
				})(maxLength);
			}
		},


		/** Helper function called at the start of each class method. Internal use only. */
		preop = function preop() {
			var error,
			    i,
			    args = arguments,
			    rSpace = /\s+/;

			/** Validate the token/s passed to an instance method, if any. */
			if (args[LENGTH]) for (i = 0; i < args[LENGTH]; ++i) {
				if (rSpace.test(args[i])) {
					error = new SyntaxError('String "' + args[i] + '" ' + CONTAINS + ' an invalid character');
					error.code = 5;
					error.name = "InvalidCharacterError";
					throw error;
				}
			} /** Split the new value apart by whitespace*/
			tokens = ("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);

			/** Avoid treating blank strings as single-item token lists */
			if ("" === tokens[0]) tokens = [];

			/** Repopulate the internal token lists */
			tokenMap = {};
			for (i = 0; i < tokens[LENGTH]; ++i) {
				tokenMap[tokens[i]] = TRUE;
			}length = tokens[LENGTH];
			reindex();
		};

		/** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
		preop();

		/** Return the number of tokens in the underlying string. Read-only. */
		defineGetter(THIS, LENGTH, function () {
			preop();
			return length;
		});

		/** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
		THIS[METHODS[6] /** toLocaleString */] = THIS[METHODS[5] /** toString       */] = function () {
			preop();
			return tokens.join(SPACE);
		};

		/** Return an item in the list by its index (or undefined if the number is greater than or equal to the length of the list) */
		THIS.item = function (idx) {
			preop();
			return tokens[idx];
		};

		/** Return TRUE if the underlying string contains `token`; otherwise, FALSE. */
		THIS[CONTAINS] = function (token) {
			preop();
			return !!tokenMap[token];
		};

		/** Add one or more tokens to the underlying string. */
		THIS[ADD] = function () {
			preop[APPLY](THIS, args = arguments);

			for (var args, token, i = 0, l = args[LENGTH]; i < l; ++i) {
				token = args[i];
				if (!tokenMap[token]) {
					tokens.push(token);
					tokenMap[token] = TRUE;
				}
			}

			/** Update the targeted attribute of the attached element if the token list's changed. */
			if (length !== tokens[LENGTH]) {
				length = tokens[LENGTH] >>> 0;
				el[prop] = tokens.join(SPACE);
				reindex();
			}
		};

		/** Remove one or more tokens from the underlying string. */
		THIS[REMOVE] = function () {
			preop[APPLY](THIS, args = arguments);

			/** Build a hash of token names to compare against when recollecting our token list. */
			for (var args, ignore = {}, i = 0, t = []; i < args[LENGTH]; ++i) {
				ignore[args[i]] = TRUE;
				delete tokenMap[args[i]];
			}

			/** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
			for (i = 0; i < tokens[LENGTH]; ++i) {
				if (!ignore[tokens[i]]) t.push(tokens[i]);
			}tokens = t;
			length = t[LENGTH] >>> 0;

			/** Update the targeted attribute of the attached element. */
			el[prop] = tokens.join(SPACE);
			reindex();
		};

		/** Add or remove a token depending on whether it's already contained within the token list. */
		THIS[TOGGLE] = function (token, force) {
			preop[APPLY](THIS, [token]);

			/** Token state's being forced. */
			if (UNDEF !== force) {
				if (force) {
					THIS[ADD](token);return TRUE;
				} else {
					THIS[REMOVE](token);return FALSE;
				}
			}

			/** Token already exists in tokenList. Remove it, and return FALSE. */
			if (tokenMap[token]) {
				THIS[REMOVE](token);
				return FALSE;
			}

			/** Otherwise, add the token and return TRUE. */
			THIS[ADD](token);
			return TRUE;
		};

		/** Mark our newly-assigned methods as non-enumerable. */
		(function (o, defineProperty) {
			if (defineProperty) for (var i = 0; i < 7; ++i) {
				defineProperty(o, METHODS[i], { enumerable: FALSE });
			}
		})(THIS, OBJ[DEFINE_PROPERTY]);

		return THIS;
	},


	/** Polyfills a property with a DOMTokenList */
	addProp = function addProp(o, name, attr) {

		defineGetter(o[PROTOTYPE], name, function () {
			var tokenList,
			    THIS = this,


			/** Prevent this from firing twice for some reason. What the hell, IE. */
			gibberishProperty = DEFINE_GETTER + DEFINE_PROPERTY + name;
			if (THIS[gibberishProperty]) return tokenList;
			THIS[gibberishProperty] = TRUE;

			/**
    * IE8 can't define properties on native JavaScript objects, so we'll use a dumb hack instead.
    *
    * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
    * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
    * element instead, this would conflict with element types which use indexed properties (such as forms and
    * select lists).
    */
			if (FALSE === dpSupport) {

				var visage,
				    mirror = addProp.mirror = addProp.mirror || DOC[CREATE_ELEMENT](DIV),
				    reflections = mirror.childNodes,


				/** Iterator variables */
				l = reflections[LENGTH],
				    i = 0;

				for (; i < l; ++i) {
					if (reflections[i]._R === THIS) {
						visage = reflections[i];
						break;
					}
				} /** Couldn't find an element's reflection inside the mirror. Materialise one. */
				visage || (visage = mirror.appendChild(DOC[CREATE_ELEMENT](DIV)));

				tokenList = DOMTokenList.call(visage, THIS, attr);
			} else tokenList = new DOMTokenList(THIS, attr);

			defineGetter(THIS, name, function () {
				return tokenList;
			});
			delete THIS[gibberishProperty];

			return tokenList;
		}, TRUE);
	},


	/** Variables used for patching native methods that're partially implemented (IE doesn't support adding/removing multiple tokens, for instance). */
	testList,
	    nativeAdd,
	    nativeRemove;

	/** No discernible DOMTokenList support whatsoever. Time to remedy that. */
	if (!WIN[DOM_TOKEN_LIST]) {

		/** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
		if (dpSupport) try {
			defineGetter({}, "support");
		} catch (e) {
			dpSupport = FALSE;
		}

		DOMTokenList.polyfill = TRUE;
		WIN[DOM_TOKEN_LIST] = DOMTokenList;

		addProp(WIN[ELEMENT], CLASS_LIST, CLASS_ + "Name"); /* Element.classList */
		addProp(WIN[HTML_ + "Link" + ELEMENT], REL_LIST, REL); /* HTMLLinkElement.relList */
		addProp(WIN[HTML_ + "Anchor" + ELEMENT], REL_LIST, REL); /* HTMLAnchorElement.relList */
		addProp(WIN[HTML_ + "Area" + ELEMENT], REL_LIST, REL); /* HTMLAreaElement.relList */
	}

	/**
  * Possible support, but let's check for bugs.
  *
  * Where arbitrary values are needed for performing a test, previous variables
  * are recycled to save space in the minified file.
  */
	else {
			testList = DOC[CREATE_ELEMENT](DIV)[CLASS_LIST];

			/** We'll replace a "string constant" to hold a reference to DOMTokenList.prototype (filesize optimisation, yaddah-yaddah...) */
			PROTOTYPE = WIN[DOM_TOKEN_LIST][PROTOTYPE];

			/** Check if we can pass multiple arguments to add/remove. To save space, we'll just recycle a previous array of strings. */
			testList[ADD][APPLY](testList, METHODS);
			if (2 > testList[LENGTH]) {
				nativeAdd = PROTOTYPE[ADD];
				nativeRemove = PROTOTYPE[REMOVE];

				PROTOTYPE[ADD] = function () {
					for (var i = 0, args = arguments; i < args[LENGTH]; ++i) {
						nativeAdd.call(this, args[i]);
					}
				};

				PROTOTYPE[REMOVE] = function () {
					for (var i = 0, args = arguments; i < args[LENGTH]; ++i) {
						nativeRemove.call(this, args[i]);
					}
				};
			}

			/** Check if the "force" option of .toggle is supported. */
			if (testList[TOGGLE](LIST, FALSE)) PROTOTYPE[TOGGLE] = function (token, force) {
				var THIS = this;
				THIS[(force = UNDEF === force ? !THIS[CONTAINS](token) : force) ? ADD : REMOVE](token);
				return !!force;
			};
		}
})();

function getClosest(elem, selector) {
  var firstChar = selector.charAt(0);
  // Get closest match
  for (; elem && elem !== document; elem = elem.parentNode) {

    // If selector is a class
    if (firstChar === ".") {
      if (elem.classList.contains(selector.substr(1))) {
        return elem;
      }
    }

    // If selector is an ID
    if (firstChar === "#") {
      if (elem.id === selector.substr(1)) {
        return elem;
      }
    }

    // If selector is a data attribute
    if (firstChar === "[") {
      if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
        return elem;
      }
    }

    // If selector is a tag
    if (elem.tagName.toLowerCase() === selector) {
      return elem;
    }
  }
  return false;
}

// var elem = document.querySelector("#some-element");
// var closest = getClosest(elem, ".some-class");
// var closestLink = getClosest(elem, "a");
// var closestExcludingElement = getClosest(elem.parentNode, ".some-class");

var Length$1 = function (Length) {
    "use strict";

    // create a test element

    var testElem = document.createElement('test'),
        docElement = document.documentElement,
        defaultView = document.defaultView,
        getComputedStyle = defaultView && defaultView.getComputedStyle,
        computedValueBug,
        runit = /^(-?[\d+\.\-]+)([a-z]+|%)$/i,
        convert = {},
        conversions = [1 / 25.4, 1 / 2.54, 1 / 72, 1 / 6],
        units = ['mm', 'cm', 'pt', 'pc', 'in', 'mozmm'],
        i = 6; // units.length

    // add the test element to the dom
    docElement.appendChild(testElem);

    // test for the WebKit getComputedStyle bug
    // @see http://bugs.jquery.com/ticket/10639
    if (getComputedStyle) {
        // add a percentage margin and measure it
        testElem.style.marginTop = '1%';
        computedValueBug = getComputedStyle(testElem).marginTop === '1%';
    }

    // pre-calculate absolute unit conversions
    while (i--) {
        convert[units[i] + "toPx"] = conversions[i] ? conversions[i] * convert.inToPx : toPx(testElem, '1' + units[i]);
    }

    // remove the test element from the DOM and delete it
    docElement.removeChild(testElem);
    testElem = undefined;

    // convert a value to pixels
    function toPx(elem, value, prop, force) {
        // use width as the default property, or specify your own
        prop = prop || 'width';

        var style,
            inlineValue,
            ret,
            unit = (value.match(runit) || [])[2],
            conversion = unit === 'px' ? 1 : convert[unit + 'toPx'],
            rem = /r?em/i;

        if (conversion || rem.test(unit) && !force) {
            // calculate known conversions immediately
            // find the correct element for absolute units or rem or fontSize + em or em
            elem = conversion ? elem : unit === 'rem' ? docElement : prop === 'fontSize' ? elem.parentNode || elem : elem;

            // use the pre-calculated conversion or fontSize of the element for rem and em
            conversion = conversion || parseFloat(curCSS(elem, 'fontSize'));

            // multiply the value by the conversion
            ret = parseFloat(value) * conversion;
        } else {
            // begin "the awesome hack by Dean Edwards"
            // @see http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

            // remember the current style
            style = elem.style;
            inlineValue = style[prop];

            // set the style on the target element
            try {
                style[prop] = value;
            } catch (e) {
                // IE 8 and below throw an exception when setting unsupported units
                return 0;
            }

            // read the computed value
            // if style is nothing we probably set an unsupported unit
            ret = !style[prop] ? 0 : parseFloat(curCSS(elem, prop));

            // reset the style back to what it was or blank it out
            style[prop] = inlineValue !== undefined ? inlineValue : null;
        }

        // return a number
        return ret;
    }

    // return the computed value of a CSS property
    function curCSS(elem, prop) {
        var value,
            pixel,
            unit,
            rvpos = /^top|bottom/,
            outerProp = ["paddingTop", "paddingBottom", "borderTop", "borderBottom"],
            innerHeight,
            parent,
            i = 4; // outerProp.length

        if (getComputedStyle) {
            // FireFox, Chrome/Safari, Opera and IE9+
            value = getComputedStyle(elem)[prop];
        } else if (pixel = elem.style['pixel' + prop.charAt(0).toUpperCase() + prop.slice(1)]) {
            // IE and Opera support pixel shortcuts for top, bottom, left, right, height, width
            // WebKit supports pixel shortcuts only when an absolute unit is used
            value = pixel + 'px';
        } else if (prop === 'fontSize') {
            // correct IE issues with font-size
            // @see http://bugs.jquery.com/ticket/760
            value = toPx(elem, '1em', 'left', 1) + 'px';
        } else {
            // IE 8 and below return the specified style
            value = elem.currentStyle[prop];
        }

        // check the unit
        unit = (value.match(runit) || [])[2];
        if (unit === '%' && computedValueBug) {
            // WebKit won't convert percentages for top, bottom, left, right, margin and text-indent
            if (rvpos.test(prop)) {
                // Top and bottom require measuring the innerHeight of the parent.
                innerHeight = (parent = elem.parentNode || elem).offsetHeight;
                while (i--) {
                    innerHeight -= parseFloat(curCSS(parent, outerProp[i]));
                }
                value = parseFloat(value) / 100 * innerHeight + 'px';
            } else {
                // This fixes margin, left, right and text-indent
                // @see https://bugs.webkit.org/show_bug.cgi?id=29084
                // @see http://bugs.jquery.com/ticket/10639
                value = toPx(elem, value);
            }
        } else if ((value === 'auto' || unit && unit !== 'px') && getComputedStyle) {
            // WebKit and Opera will return auto in some cases
            // Firefox will pass back an unaltered value when it can't be set, like top on a static element
            value = 0;
        } else if (unit && unit !== 'px' && !getComputedStyle) {
            // IE 8 and below won't convert units for us
            // try to convert using a prop that will return pixels
            // this will be accurate for everything (except font-size and some percentages)
            value = toPx(elem, value) + 'px';
        }
        return value;
    }

    // expose the conversion function to the window object
    window.Length = {
        toPx: toPx
    };
}(window.Length || {});

function getHeight(el) {
    var pattern = /\d/,
        // check if value contains digital number
    height = el.clientHeight,
        style = el.currentStyle || getComputedStyle(el),
        paddingTop = pattern.exec(style.paddingTop) === null ? "0px" : style.paddingTop,
        paddingBottom = pattern.exec(style.paddingBottom) === null ? "0px" : style.paddingBottom;

    height -= parseInt(Length.toPx(el, paddingTop)) + parseInt(Length.toPx(el, paddingBottom));
    return height;
}

// 1. outer size: content + padding + border + margin //
// 2. offset size: content + padding + border //
//    el.offsetWidth  
//    el.offsetHeight
// 3. client size: content + padding
//    el.clientWidth  
//    el.clientHeight
// 4. size: content

function getOffsetLeft(el) {
  var rect = el.getBoundingClientRect(),
      left = rect.left + document.body.scrollLeft;
  return Math.round(left);
}

function getOffsetTop(el) {
  var rect = el.getBoundingClientRect(),
      top = rect.top + document.body.scrollTop;
  return Math.round(top);
}

function getOuterHeight(el) {
    var pattern = /\d/,
        // check if value contains digital number
    height = el.offsetHeight,
        style = el.currentStyle || getComputedStyle(el),
        marginTop = pattern.exec(style.marginTop) === null ? "0px" : style.marginTop,
        marginBottom = pattern.exec(style.marginBottom) === null ? "0px" : style.marginBottom;

    height += parseInt(Length.toPx(el, marginTop)) + parseInt(Length.toPx(el, marginBottom));
    return height;
}

// 1. outer size: content + padding + border + margin //
// 2. offset size: content + padding + border //
//    el.offsetWidth  
//    el.offsetHeight

// 3. client size: content + padding
//    el.clientWidth  
//    el.clientHeight

function getOuterWidth(el) {
    var pattern = /\d/,
        // check if value contains digital number
    width = el.offsetWidth,
        style = el.currentStyle || getComputedStyle(el),
        marginLeft = pattern.exec(style.marginLeft) === null ? "0px" : style.marginLeft,
        marginRight = pattern.exec(style.marginRight) === null ? "0px" : style.marginRight;

    width += parseInt(Length.toPx(el, marginLeft)) + parseInt(Length.toPx(el, marginRight));
    return width;
}

// 1. outer size: content + padding + border + margin //
// 2. offset size: content + padding + border //
//    el.offsetWidth  
//    el.offsetHeight
// 3. client size: content + padding
//    el.clientWidth  
//    el.clientHeight

function getParents(elem, selector) {
  var parents = [];
  if (selector) {
    var firstChar = selector.charAt(0);
  }

  // Get matches
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (selector) {

      // If selector is a class
      if (firstChar === ".") {
        if (elem.classList.contains(selector.substr(1))) {
          parents.push(elem);
        }
      }

      // If selector is an ID
      if (firstChar === "#") {
        if (elem.id === selector.substr(1)) {
          parents.push(elem);
        }
      }

      // If selector is a data attribute
      if (firstChar === "[") {
        if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
          parents.push(elem);
        }
      }

      // If selector is a tag
      if (elem.tagName.toLowerCase() === selector) {
        parents.push(elem);
      }
    } else {
      parents.push(elem);
    }
  }

  // Return parents if any exist
  if (parents.length === 0) {
    return null;
  } else {
    return parents;
  }
}

// var elem = document.querySelector("#some-element");
// var parents = getParents(elem, ".some-class");
// var allParents = getParents(elem.parentNode);

function getParentsUntil(elem, parent, selector) {

  var parents = [];
  if (parent) {
    var parentType = parent.charAt(0);
  }
  if (selector) {
    var selectorType = selector.charAt(0);
  }

  // Get matches
  for (; elem && elem !== document; elem = elem.parentNode) {

    // Check if parent has been reached
    if (parent) {

      // If parent is a class
      if (parentType === ".") {
        if (elem.classList.contains(parent.substr(1))) {
          break;
        }
      }

      // If parent is an ID
      if (parentType === "#") {
        if (elem.id === parent.substr(1)) {
          break;
        }
      }

      // If parent is a data attribute
      if (parentType === "[") {
        if (elem.hasAttribute(parent.substr(1, parent.length - 1))) {
          break;
        }
      }

      // If parent is a tag
      if (elem.tagName.toLowerCase() === parent) {
        break;
      }
    }

    if (selector) {

      // If selector is a class
      if (selectorType === ".") {
        if (elem.classList.contains(selector.substr(1))) {
          parents.push(elem);
        }
      }

      // If selector is an ID
      if (selectorType === "#") {
        if (elem.id === selector.substr(1)) {
          parents.push(elem);
        }
      }

      // If selector is a data attribute
      if (selectorType === "[") {
        if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
          parents.push(elem);
        }
      }

      // If selector is a tag
      if (elem.tagName.toLowerCase() === selector) {
        parents.push(elem);
      }
    } else {
      parents.push(elem);
    }
  }

  // Return parents if any exist
  if (parents.length === 0) {
    return null;
  } else {
    return parents;
  }
}

// Examples
// var elem = document.querySelector("#some-element");
// var parentsUntil = getParentsUntil(elem, ".some-class");
// var parentsUntilByFilter = getParentsUntil(elem, ".some-class", "[data-something]");
// var allParentsUntil = getParentsUntil(elem);
// var allParentsExcludingElem = getParentsUntil(elem.parentNode);

function getSiblings(elem) {
  var siblings = [];
  var sibling = elem.parentNode.firstChild;
  for (; sibling; sibling = sibling.nextSibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
  }
  return siblings;
}

// var elem = document.querySelector('#some-element');
// var siblings = getSiblings(elem);

function getSupportedProp(proparray) {
  var root = document.documentElement;
  for (var i = 0; i < proparray.length; i++) {
    if (proparray[i] in root.style) {
      return proparray[i];
    }
  }
}

// var getTD = gn.getSupportedProp(['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration', 'OTransitionDuration']),
// getTransform = gn.getSupportedProp(['transform', 'WebkitTransform', 'MozTransform', 'OTransform']);

function getWidth(el) {
    var pattern = /\d/,
        // check if value contains digital number
    width = el.clientWidth,
        style = el.currentStyle || getComputedStyle(el),
        paddingLeft = pattern.exec(style.paddingLeft) === null ? "0px" : style.paddingLeft,
        paddingRight = pattern.exec(style.paddingRight) === null ? "0px" : style.paddingRight;

    width -= parseInt(Length.toPx(el, paddingLeft)) + parseInt(Length.toPx(el, paddingRight));
    return width;
}

// 1. outer size: content + padding + border + margin
// 2. offset size: content + padding + border 
//    el.offsetWidth  
//    el.offsetHeight

// 3. client size: content + padding
//    el.clientWidth  
//    el.clientHeight
// 4. size: content

function indexOf(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === item) {
      return i;
    }
  }
  return -1;
}

function isInViewport(elem) {
  var rect = elem.getBoundingClientRect();
  return rect.bottom > 0 && rect.right > 0 && rect.top < document.documentElement.clientHeight && rect.left < document.documentElement.clientWidth;
}

// forEach

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (block, thisObject) {
    var len = this.length >>> 0;
    for (var i = 0; i < len; i++) {
      if (i in this) {
        block.call(thisObject, this[i], i, this);
      }
    }
  };
}

// addEventListener
// removeEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener#Compatibility

(function () {
  if (!Element.prototype.addEventListener) {
    var eventListeners = [];

    var addEventListener = function addEventListener(type, listener /*, useCapture (will be ignored) */) {
      var self = this;
      var wrapper = function wrapper(e) {
        e.target = e.srcElement;
        e.currentTarget = self;
        if (typeof listener.handleEvent != "undefined") {
          listener.handleEvent(e);
        } else {
          listener.call(self, e);
        }
      };
      if (type == "DOMContentLoaded") {
        var wrapper2 = function wrapper2(e) {
          if (document.readyState == "complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange", wrapper2);
        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper2 });

        if (document.readyState == "complete") {
          var e = new Event();
          e.srcElement = window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on" + type, wrapper);
        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper });
      }
    };
    var removeEventListener = function removeEventListener(type, listener /*, useCapture (will be ignored) */) {
      var counter = 0;
      while (counter < eventListeners.length) {
        var eventListener = eventListeners[counter];
        if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
          if (type == "DOMContentLoaded") {
            this.detachEvent("onreadystatechange", eventListener.wrapper);
          } else {
            this.detachEvent("on" + type, eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener = addEventListener;
    Element.prototype.removeEventListener = removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener = addEventListener;
      HTMLDocument.prototype.removeEventListener = removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener = addEventListener;
      Window.prototype.removeEventListener = removeEventListener;
    }
  }
})();

// https://developer.mozilla.org/en-US/docs/Web/Events/resize#requestAnimationFrame

var optimizedResize = function () {

  var callbacks = [],
      running = false;

  // fired on resize event
  function resize() {

    if (!running) {
      running = true;

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks);
      } else {
        setTimeout(runCallbacks, 66);
      }
    }
  }

  // run the actual callbacks
  function runCallbacks() {

    callbacks.forEach(function (callback) {
      callback();
    });

    running = false;
  }

  // adds callback to loop
  function addCallback(callback) {

    if (callback) {
      callbacks.push(callback);
    }
  }

  return {
    // public method to add additional callback
    add: function add(callback) {
      if (!callbacks.length) {
        window.addEventListener("resize", resize);
      }
      addCallback(callback);
    }
  };
}();

// start process
// gn.optimizedResize.add(function() {
//   console.log("Resource conscious resize callback!")
// });

function prepend(els, data) {
  var els_new = isNodeList(els) ? els : [els],
      i;

  if (typeof data.nodeType !== "undefined" && data.nodeType === 1) {
    for (i = els_new.length; i--;) {
      els_new[i].insertBefore(data, els_new[i].firstChild);
    }
  } else if (typeof data === "string") {
    for (i = els_new.length; i--;) {
      els_new[i].insertAdjacentHTML("afterbegin", data);
    }
  } else if (isNodeList(data)) {
    var fragment = document.createDocumentFragment();
    for (i = data.length; i--;) {
      fragment.insertBefore(data[i], fragment.firstChild);
    }
    for (var j = els_new.length; j--;) {
      els_new[j].insertBefore(fragment, els_new[j].firstChild);
    }
  }
}

function unwrap(els) {
  var elsNew = isNodeList(els) ? els : [els];
  for (var i = elsNew.length; i--;) {
    var el = elsNew[i];

    // get the element's parent node
    var parent = el.parentNode;

    // move all children out of the element
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el);
    }

    // remove the empty element
    parent.removeChild(el);
  }
}

function wrap(els, obj) {
  var elsNew = isNodeList(els) ? els : [els];
  // Loops backwards to prevent having to clone the wrapper on the
  // first element (see `wrapper` below).
  for (var i = elsNew.length; i--;) {
    var wrapper = i > 0 ? obj.cloneNode(true) : obj,
        el = elsNew[i];

    // Cache the current parent and sibling.
    var parent = el.parentNode,
        sibling = el.nextSibling;

    // Wrap the element (is automatically removed from its current parent).
    wrapper.appendChild(el);

    // If the element had a sibling, insert the wrapper before
    // the sibling to maintain the HTML structure; otherwise, just
    // append it to the parent.
    if (sibling) {
      parent.insertBefore(wrapper, sibling);
    } else {
      parent.appendChild(wrapper);
    }
  }
}

function wrapAll(els, wrapper) {
  // Cache the current parent and sibling of the first element.
  var el = els.length ? els[0] : els,
      parent = el.parentNode,
      sibling = el.nextSibling;

  // Wrap all elements (if applicable). Each element is
  // automatically removed from its current parent and from the elms
  // array.
  for (var i = 0; i < els.length; i++) {
    wrapper.appendChild(els[i]);
  }

  // If the first element had a sibling, insert the wrapper before the
  // sibling to maintain the HTML structure; otherwise, just append it
  // to the parent.
  if (sibling !== els[1]) {
    parent.insertBefore(wrapper, sibling);
  } else {
    parent.appendChild(wrapper);
  }
}

var gn = function (g) {
  g.isNodeList = isNodeList;
  g.append = append;
  g.createElement = createElement;
  g.ready = ready;
  g.extend = extend;
  g.getClosest = getClosest;
  g.getHeight = getHeight;
  g.getOffsetLeft = getOffsetLeft;
  g.getOffsetTop = getOffsetTop;
  g.getOuterHeight = getOuterHeight;
  g.getOuterWidth = getOuterWidth;
  g.getParents = getParents;
  g.getParentsUntil = getParentsUntil;
  g.getSiblings = getSiblings;
  g.getSupportedProp = getSupportedProp;
  g.getWidth = getWidth;
  g.indexOf = indexOf;
  g.isInViewport = isInViewport;
  g.optimizedResize = optimizedResize;
  g.prepend = prepend;
  g.unwrap = unwrap;
  g.wrap = wrap;
  g.wrapAll = wrapAll;

  return g;
}(window.gn || {});

exports.gn = gn;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=go-native.js.map
