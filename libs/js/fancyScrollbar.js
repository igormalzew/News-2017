(function($) {

	/**
	 * @class Scroll
	 * @param $el {jQuery}
	 * @constructor
	 */
	var Scroll = function($el) {

		/**
		 * @property self
		 * @type {Scroll}
		 * @private
		 * @final
		 */
		var self = this;

		/**
		 * @property $viewport
		 * @type {jQuery}
		 * @private
		 * @final
		 */
		var $viewport = $el.find('> .viewport');

		/**
		 * @property $content
		 * @type {jQuery}
		 * @private
		 * @final
		 */
		var $content = $viewport.find('> .content');

		var $scrollbar = {

			/**
			 * @property $scrollbar.x
			 * @type {jQuery}
			 * @private
			 * @final
			 */
			x: null,

			/**
			 * @property $scrollbar.y
			 * @type {jQuery}
			 * @private
			 * @final
			 */
			y: null
		};

		var $thumb = {

			/**
			 * @property $thumb.x
			 * @type {jQuery}
			 * @private
			 * @final
			 */
			x: null,

			/**
			 * @property $thumb.y
			 * @type {jQuery}
			 * @private
			 * @final
			 */
			y: null
		}

		var lastScroll = {

			/**
			 * @property lastScroll.top
			 * @type {number}
			 * @default -1
			 * @private
			 */
			top: -1,

			/**
			 * @property lastScroll.left
			 * @type {number}
			 * @default -1
			 * @private
			 */
			left: -1
		};

		/**
		 * @property id
		 * @type {string}
		 * @private
		 * @final
		 */
		var id = identifier + counter++;

		/**
		 * @method update
		 * @public
		 */
		this.update = function(isReload) {
			var scroll = {
				top:  $viewport.scrollTop(),
				left: $viewport.scrollLeft()
			};
			var perform = function(vertical) {
				var vocab = vocabulary(vertical);

				var scrollSize = $content[0]['scroll' + vocab.sizeUpper];
				var viewportSize = $viewport[vocab.size]();
				if(scrollSize <= viewportSize) {
					$scrollbar[vocab.axis].addClass('disabled');
					return;
				}
				else {
					$scrollbar[vocab.axis].removeClass('disabled');
				}

				if (scroll[vocab.pos] !== lastScroll[vocab.pos] || isReload) {
				    var lastPosition = lastScroll[vocab.pos];

					lastScroll[vocab.pos] = scroll[vocab.pos];
					var elSize = $el[vocab.size]();

					var maxScrollSize = scrollSize - elSize;
					var ratio = elSize / scrollSize;
					var scrollRelative = scroll[vocab.pos] / maxScrollSize;
					var thumbSize = ((ratio > 1) ? 1 : ratio) * elSize;
					var scrollbarSize = $scrollbar[vocab.axis][vocab.size]();

					var css = {};
					css[vocab.size] = thumbSize + 'px';
					css[vocab.pos] = (scrollRelative * (scrollbarSize - thumbSize)) + 'px';
					$thumb[vocab.axis].css(css);

					if (!isReload && maxScrollSize - scroll[vocab.pos] < 400 && lastPosition < scroll[vocab.pos]) {
					    var angularScope = angular.element(document.getElementById('DisplayNewsListController')).scope();
					    angularScope.News.getNews({ isAdditionalNewsLoading : true });
					}
				}
			}
			perform(true);
		}

		/**
		 * @method setupEvents
		 * @param vertical {boolean}
		 * @private
		 */
		var setupEvents = function() {
			$viewport.scroll(function(e) {
				self.update();
			});

			var setupOrientation = function(vertical) {
				var vocab = vocabulary(vertical);
				$scrollbar[vocab.axis].click(function(e) {
					if($(e.target).is($scrollbar[vocab.axis])) {
						var move = $viewport[vocab.size]();
						if(parseFloat($thumb[vocab.axis].css(vocab.pos)) >
						   (e['page' + vocab.axisUpper] -
						    $scrollbar[vocab.axis].offset()[vocab.pos])) {
							move *= -1;
						}
						$viewport['scroll' + vocab.posUpper]($viewport['scroll' +
						                                               vocab.posUpper]() +
						                                     move);
						self.update();
					}
				});
				$thumb[vocab.axis].mousedown(function(e) {
					var $body = $doc.find('body');
					var origUnselectable = $body.attr('unselectable');
					$body.attr('unselectable', 'on');
					var last = e['page' + vocab.axisUpper];
                    
					var lastUpdate = new Date();

					$scrollbar[vocab.axis].addClass('dragScrolling');
					$doc.on('mousemove.' + id, function (e) {
					    if (new Date() - lastUpdate < 25)
					        return;
					    lastUpdate = new Date();

						var elSize = $el[vocab.size]();
						var scrollSize = $content[0]['scroll' + vocab.sizeUpper];
						var ratio = elSize / scrollSize;
						var move = (e['page' + vocab.axisUpper] - last) / ratio;
						$viewport['scroll' + vocab.posUpper]($viewport['scroll' + vocab.posUpper]() + move);
						last = e['page' + vocab.axisUpper];
						self.update();
						// Prevent selection
						e.preventDefault();
					});
					$doc.on('selectstart.' + id, function(e) {
						e.preventDefault();
					});
					$doc.one('mouseup', function(e) {
						$doc.off('.' + id);
						$body.attr('unselectable', origUnselectable || 'off');
						$scrollbar[vocab.axis].removeClass('dragScrolling');
					});
				});
			}

			setupOrientation(true);
		}

		/**
		 * @method init
		 * @private
		 */
		var init = function() {
			if($el.is('.scrollY')) {
				$el.prepend($(scrollbarTpl).addClass('scrollbarY'));
			}
			$scrollbar.y = $el.find('> .scrollbarY');
			$thumb.y = $scrollbar.y.find('> .thumb');

			setupEvents();

			$el.addClass('initialized');
			self.update();
		}

		init.apply(this);
	}

	/**
	 * @property identifier
	 * @type {string}
	 * @private
	 * @static
	 * @final
	 */
	var identifier = '__jsFancyScroll';

	/**
	 * @property counter
	 * @type {number}
	 * @default 0
	 * @private
	 * @static
	 */
	var counter = 0;

	/**
	 * @property scrollbarSize
	 * @type {number}
	 * @default 0
	 * @private
	 * @static
	 */
	var scrollbarSize = 0;

	/**
	 * @property $doc
	 * @type {jQuery}
	 * @private
	 * @static
	 * @final
	 */
	var $doc = $(document);

	/**
	 * @property scrollbarTpl
	 * @type {string}
	 * @private
	 * @static
	 * @final
	 */
	var scrollbarTpl = '<div><div class="thumb"></div></div>';

	/**
	 * @method vocabulary
	 * @param vertical {boolean}
	 * @private
	 * @static
	 */
	var vocabulary = function(vertical) {
		return {
			axis: vertical ? 'y' : 'x',
			axisUpper: vertical ? 'Y' : 'X',
			pos: vertical ? 'top' : 'left',
			posUpper: vertical ? 'Top' : 'Left',
			size: vertical ? 'height' : 'width',
			sizeUpper: vertical ? 'Height' : 'Width'
		};
	}

	/**
	 * @for jQuery.fn
	 * @method fancyScroll
	 * @chainable
	 * @public
	 */
	$.fn.fancyScroll = function (params) {
	    if (params == undefined) params = {};

		this.filter('.scrollX, .scrollY').each(function(i, el) {
			var $el = $(el);
			var scroll = $el.data(identifier);
			if(!scroll) {
				scroll = new Scroll($el);
				$el.data(identifier, scroll);
			}
			else {
			    scroll.update(params.reload);
			}
		});
		return this;
	}

})(jQuery);