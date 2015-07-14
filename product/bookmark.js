// Bookmark.js
// www.bespoyasov.ru

(function($) {

	$.fn.bookmark = function(options){  

		// ! settings
		
    var settings = $.extend({
	    autoHide: true,
	    fadeTime: 400,
	    autoHideTime: 800,
	    scrollingTime: 500,
	    heightDelta: 100,
	    hashChange: true,
	    hashPrefix : '',
	    bookmarkClassName: 'bookmark',
	    touchDevices: false,
	    onScrollStart: function() {},
	    onScrollEnd: function() {}
    }, options);
    
    
    // ! init
    
    return this.each(function(){     
	    
	    var is_windows_touch = false; if (navigator.userAgent.toLowerCase().indexOf("windows phone") != -1) {is_windows_touch = true;}
			var is_touch_device = 'ontouchstart' in document.documentElement;
			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1;
			var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

			
			var sessionNumber = (Math.floor(Math.random() * (100 - 1 + 1)) + 1) + (Math.floor(Math.random() * (100 - 1 + 1)) + 1),
					coords = [],
					finalCoords = [],
					anchors = [],
					names = [],
					prevhs = [],
					nolink = false,
					clickedMotionFlag = false,
					hoverredFlag = false,
					scrollingMotionFlag = false,
					maxW = 0;		
			
			var	alreadeyScrolling = false,
					startScrollY = 0,
					currentScrollY = 0,
					scrollCanPush = true,
					scrolls = [],
					scrollingHeightCoeff = 10*settings.heightDelta/*settings.heightDelta*/;
			
			var containerClassName = 'bookmarks-container',
					hoverZoneClassName = 'bookmarks-hoverzone',
					linkClassName = settings.bookmarkClassName;
			
			var $this = $(this);
			
			$(this).attr('data-session',sessionNumber);
			sessionNumber = $(this).attr('data-session');
			
			
			function checkDataattrs() {
				if ($this.attr('data-autoHide') == 'false') {settings.autoHide = false;}
				if ($this.attr('data-fadeTime') != undefined) {settings.fadeTime = parseInt($this.attr('data-fadeTime'));}
				if ($this.attr('data-autoHideTime') != undefined) {settings.autoHideTime = parseInt($this.attr('data-autoHideTime'));}
				if ($this.attr('data-scrollingTime') != undefined) {settings.scrollingTime = parseInt($this.attr('data-scrollingTime'));}
				if ($this.attr('data-heightDelta') != undefined) {settings.heightDelta = parseInt($this.attr('data-heightDelta'));}
				if ($this.attr('data-hashChange') == 'false') {settings.hashChange = false;}
				if ($this.attr('data-hashPrefix') != undefined) {settings.hashPrefix = $this.attr('data-hashPrefix');}
				if ($this.attr('data-touchDevices') == 'true') {settings.touchDevices = true;}
				if ($this.attr('data-bookmarkClassName') != undefined) {
					settings.bookmarkClassName = $this.attr('data-bookmarkClassName');
					linkClassName = settings.bookmarkClassName;
				}
			};
			
			
			function trimString(s) {
			  s = s.replace(/^-/, '');
			  return s.replace(/-$/, '');
			};
			
			
			function translit(str){
				
				var space = '-';  
				str = str.toLowerCase();
				var transl = {
				'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 
				'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
				'о': 'o', 'п': 'p', 'р': 'r','с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
				'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh','ъ': space, 'ы': 'y', 'ь': space, 'э': 'e', 'ю': 'yu', 'я': 'ya',
				' ': space, '_': space, '`': space, '~': space, '!': space, '@': space,
				'#': space, '$': space, '%': space, '^': space, '&': space, '*': space, 
				'(': space, ')': space,'-': space, '\=': space, '+': space, '[': space, 
				']': space, '\\': space, '|': space, '/': space,'.': space, ',': space,
				'{': space, '}': space, '\'': space, '"': space, ';': space, ':': space,
				'?': space, '<': space, '>': space, '№':space
				};
				
				var result = '';
				var curent_sim = '';
				                
				for(i=0; i < str.length; i++) {
					if(transl[str[i]] != undefined) {
						if(curent_sim != transl[str[i]] || curent_sim != space){
							result += transl[str[i]];
							curent_sim = transl[str[i]];
						}                                                                            
					}
					else {
						result += str[i];
						curent_sim = str[i];
					}                              
				}          
				                
				result = trimString(result);               
				return result;
			};	
			
			
			function isSafari() {
				return (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0);
			};
			
			function ifIsNotMac() {
				if (!isMac) {$('html').addClass('bookmark-notMac');}
				//$('html').addClass('bookmark-notMac');
			};
			
			
			function createContainer() {			
				$('html').append('<div class="'+hoverZoneClassName+' '+hoverZoneClassName+'-'+sessionNumber+'"></div><div class="'+containerClassName+' '+containerClassName+'-'+sessionNumber+'"></div>');
			};
			
			
			function fullContainer($container, num) {
				var $link = $container.find('.'+linkClassName),
						i = 0;
				
				if (!$link.length) {
					nolink = true;
					return false;
				}
				
				$link.each(function(){
					var $this = $(this),
							h = $container.height(),
							pos = $this.offset().top,
							div = pos / h,
							top = ($('html').height()*div).toFixed(0);
							
					$this.attr('data-index',i);
					
					var prevoffset = $('.'+containerClassName+'-'+num+' [data-index="'+(i-1)+'"]').offset();
					if (prevoffset != undefined) {
						var $prev = $('.'+containerClassName+'-'+num+' [data-index="'+(i-1)+'"]'),
								prevh = $prev.outerHeight(),
								prevt = $prev.offset().top,
								pr = prevh+prevt,
								top = parseInt(top);
								
						if (top < pr)	{top += prevh;}
					}
					
					var ttl = $this.attr('name') || $this.attr('title') || $this.attr('alt');
					
					if (ttl == undefined) {
						var ttl = ''
						var text = $this.text().toString().replace(/(\n(\r)?)/g, '').replace(/\t/g, '');
						ttl = text.split(' ');
						ttl = ttl.filter(function(e){return e});
						ttl = ttl[0];
					}
					
					var srcttl = '';
					if ($this.attr('data-hash') != undefined) {srcttl = $this.attr('data-hash').toString().replace(/ /g,'-')}
					else {srcttl = translit(ttl);}
					
					$('.'+containerClassName+'-'+sessionNumber).append('<span class="bookmarks-span" data-index="'+i+'" style="top:'+top+'px"><a href="#">'+ttl+'</a></span>');
					anchors[i] = srcttl;
					
					$this.attr('data-name',srcttl).attr('name','');
					
					++i;
				});
			};
			
			
			function setCoords($container, num) {
				var $link = $container.find('.'+linkClassName),
						i = 0;
						
				$link.each(function(){
					coords[i] = $(this).offset().top
					var nextOffset = $(this).parents('[data-session="'+num+'"]').find('.'+linkClassName+'[data-index="'+(i+1)+'"]').offset();
					if (nextOffset != undefined) {finalCoords[i] = nextOffset.top;}
					else {finalCoords[i] = 10000000;}
					++i;
				});		
			};
			
			
			function startOffset($container, num) {
				var hash = location.hash.toString().replace('#','');
				if (hash !== '') {
					var pref = settings.hashPrefix;
					var ind = $('[data-session]').find('.'+linkClassName+'[data-name="'+pref+hash+'"]').attr('data-index');
					
					settings.onScrollStart(0, parseInt(ind));
					
					$('.'+containerClassName+'-'+num).find('[data-index]').removeClass('active');
					$('.'+containerClassName+'-'+num).find('[data-index="'+ind+'"]').addClass('active');
					$('html, body').delay(settings.scrollingTime).animate({scrollTop: $('[data-session]').find('.'+linkClassName+'[data-name="'+pref+hash+'"]').offset().top }, settings.scrollingTime);
					
					setTimeout(function(){
						settings.onScrollEnd(0, parseInt(ind));
					}, settings.scrollingTime);
				}
			};
			
			
			function recalcMargins($container, num) {
				var $link = $container.find('.'+linkClassName),
						i = 0;
				
				$link.each(function(){
					var $this = $(this),
							h = $container.height(),
							pos = $this.offset().top,
							div = pos / h,
							top = ($('html').height()*div).toFixed(0);
					
					var prevoffset = $('.'+containerClassName+'-'+num+' [data-index="'+(i-1)+'"]').offset();
					
					if (prevoffset != undefined) {
						var $prev = $('.'+containerClassName+'-'+num+' [data-index="'+(i-1)+'"]'),
								prevh = $prev.outerHeight(),
								prevt = $prev.offset().top,
								pr = prevh+prevt,
								top = parseInt(top);
								
						if (top < pr)	{top += prevh;}
					}
							
					$('.'+containerClassName+'-'+num+' [data-index="'+i+'"]').css({'top':top+'px'});
					++i;
				});	
			};
			
			
			function setContainerWidth(num) {
				var max = 0;
				var $link = $('.'+containerClassName+'-'+num).find('a');
				
				$link.each(function(){
					if ($(this).width() > max) {max = $(this).width()}
				});	
				
				max += 10;
				
				$('.'+containerClassName+'-'+num).width(max);
				$('.'+hoverZoneClassName+'-'+num).width(max);
			};
			
			
			function setClass(num) {
				$('html').find('.'+containerClassName+'-'+num).addClass('hover');
			};
			
			function removeClass(num) {
				$('html').find('.'+containerClassName+'-'+num).removeClass('hover');
			};
			
			function showContainer(num) {
				if (isMac) {
					var t = Math.abs(currentScrollY - startScrollY) / scrollingHeightCoeff,
							old = parseFloat($('html').find('.'+containerClassName+'-'+num).css('opacity')),
							mx = Math.max(t, old);
					
					if (t < old) {
						scrollCanPush = false;
						var pr = Math.abs(scrolls[scrolls.length - 2] - currentScrollY) / (10*scrollingHeightCoeff);
						mx += pr;
					}
					
					$('html').find('.'+containerClassName+'-'+num).css({'opacity':mx});
				}
				else {$('html').find('.'+containerClassName+'-'+num).addClass('nmhover');}	
			};
			
			function hideContainer(num) {
				if (settings.autoHide) {
					if (isMac) {$('html').find('.'+containerClassName+'-'+num).removeClass('hover').animate({'opacity':'0'}, settings.fadeTime);}
					else {$('html').find('.'+containerClassName+'-'+num).removeClass('hover nmhover').animate({'opacity':'0'}, settings.fadeTime);}
				}
			};
			
			function removeAnimation(num) {
				$('html').find('.'+containerClassName+'-'+num).stop();
			};
			
			function immidiatelyShowContainer(num) {
				$('html').find('.'+containerClassName+'-'+num).css({'opacity':'1'});
			};
			
			
			function onClick($link, num) {
				clickedMotionFlag = true;
				var ind = $link.attr('data-index');
				var curind = $('html').find('.bookmarks-span.active').attr('data-index');
				
				settings.onScrollStart(parseInt(curind), parseInt(ind));
				
				setTimeout(function(){
					clickedMotionFlag = false;
					settings.onScrollEnd(parseInt(curind), parseInt(ind))
				}, settings.scrollingTime);
				
				$link.parents('.'+containerClassName+'-'+sessionNumber).find('.bookmarks-span').removeClass('active');
				$link.addClass('active');
				
				$('html, body').animate({scrollTop: $('[data-session]').find('.'+linkClassName+'[data-index="'+ind+'"]').offset().top}, settings.scrollingTime);
				
				if (settings.hashChange) {
					var hsh = decodeURI(anchors[ind]);
					if (isSafari()) {hsh = anchors[ind];}
					location.hash = settings.hashPrefix + hsh;
				}
			};
			
			
			function defineActiveLink($container, num) {
				if (clickedMotionFlag) {return false;}
				
				var $link = $container.find('.'+linkClassName),
						i = 0,
						ind = 0;
				
				var scr = $(window).scrollTop();
				for (var j = 0; j<coords.length; ++j) {
					if (scr >= coords[j] && scr < finalCoords[j]) {
						ind = j;
					}
				}
				
				if (scr >= $(document).height() - $(window).height()) {ind = coords.length-1;}
				if (scr == 0) {ind = 0;}
				
				$('.'+containerClassName+'-'+sessionNumber).find('a[data-index]').removeClass('active');
				$('.'+containerClassName+'-'+sessionNumber).find('a[data-index="'+ind+'"]').addClass('active');
				
				if (settings.hashChange) {
					var hsh = decodeURI(anchors[ind]);
					if (isSafari()) {hsh = anchors[ind];}
					location.hash = settings.hashPrefix + hsh;
				}
			};
			
			
			
			// ! start
			
			checkDataattrs();
			ifIsNotMac();
			
			if (is_touch_device || is_windows_touch || isAndroid) {
				if (!settings.touchDevices) {return false;}
				else {$('html').addClass('bookmark-touches')}
			}
			
			createContainer();
			fullContainer($(this), sessionNumber);
			setContainerWidth(sessionNumber);
			setCoords($(this), sessionNumber);
			
			if (nolink) {
				console.log('Bookmark.js: You have no bookmarks :–)');
				return false;
			}
			
			$('.'+containerClassName+'-'+sessionNumber).find('.bookmarks-span[data-index="0"]').addClass('active');
			
			
			$('.'+hoverZoneClassName+'-'+sessionNumber).on('mouseenter', function(){
				hoverredFlag = true; 
				clearTimeout($.data(this, 'scrollTimer')); 
				setClass(sessionNumber);
			});
			
			
			$('.'+containerClassName+'-'+sessionNumber).on('mouseenter', function(){
				hoverredFlag = true; 
				clearTimeout($.data(this, 'scrollTimer')); 
				setClass(sessionNumber);
			});
			
			
			$('.'+containerClassName+'-'+sessionNumber).on('mouseleave', function(){
				immidiatelyShowContainer(sessionNumber);
				hoverredFlag = false; 
				setTimeout(function(){
					if (!hoverredFlag && !clickedMotionFlag) {
						removeAnimation(sessionNumber);
						hideContainer(sessionNumber);
					}
				}, settings.autoHideTime);
			});
			
			
			$('.'+containerClassName+'-'+sessionNumber+' a').on('click', function(e){
				e.preventDefault();
				onClick($(this).parents('[data-index]'), sessionNumber);
			});
			
			var $this = $(this);
			
			
			$(document).ready(function(){
				startOffset($(this), sessionNumber);
			});
			
			
			$(window).scroll(function(){
				removeAnimation(sessionNumber);
				if (!alreadeyScrolling) {startScrollY = $(this).scrollTop();}
				
				alreadeyScrolling = true;
				currentScrollY = $(this).scrollTop();
				if (scrollCanPush) {scrolls.push(currentScrollY);}
				
				showContainer(sessionNumber);
				defineActiveLink($this, sessionNumber);
				
				clearTimeout($.data(this, 'scrollTimer'));
		    $.data(this, 'scrollTimer', setTimeout(function() {
			    if (!hoverredFlag && !clickedMotionFlag) {
				    hideContainer(sessionNumber); 
				    alreadeyScrolling = false;
				    scrolls = [];
				    scrollCanPush = true;
				  } 
		    }, settings.autoHideTime));
			});
			
			
			$(window).resize(function(){
				recalcMargins($this, sessionNumber);
				setCoords($this, sessionNumber);
			});
			
			//$(window).on('hashchange', function(e) {e.preventDefault();});

			
    });

  };
	
	
			
	// ! autoinit
	
	$(function(){
		$('.bookmarks').bookmark();
	});
	
	
})(jQuery);