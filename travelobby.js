(function(){
	var weladjq = false;
	var weladjqui = false;
	var jqurl = '//code.jquery.com/jquery-1.11.3.min.js';
	var jqmgurl = '//code.jquery.com/jquery-migrate-1.2.1.min.js';
	var jquiurl = '//code.jquery.com/ui/1.11.4/jquery-ui.min.js';
	var baseuipre = '//code.jquery.com/ui/1.11.4/themes/';
	var baseuipost = '/jquery-ui.css';
	var ths = ['black-tie','blitzer','cupertino','dark-hive','dot-luv','eggplant','excite-bike','flick','hot-sneaks','humanity','le-frog','mint-choc','overcast','pepper-grinder','redmond','smoothness','south-street','start','sunny','swanky-purse','trontastic','ui-darkness','ui-lightness','vader'];
	var dfth = 'smoothness';
	
	var b = document;
	var crElem = 'createElement'
	var gtElems = 'getElementsByTagName';
	var gtElem = 'getElementById';
	function travelobby(){
		var console = window.console;
		window.console = window.console || {};window.console.log = window.console.log || function(output){
			var randint = Math.floor(Math.random() * (1000000-0))+1;
			var id = 'textarea__travel__'+randint;
			if(!(txt=b[gtElem](id))){
				txt = b[crElem]('textarea');
				txt.style.cssText = 'position:absolute;top:0px;right:0px;z-index:1000;';
			
				txt.setAttribute('id',id);
				b.body.appendChild(txt);
			}
			txt.value+=output+'\n';
		};
		this.debug = window.console.log;
		window.console = console;
	}
	travelobby.prototype.loadScript=function(u,c){
		var s = b[crElem]('script');s.type = 'text/javascript';s.src=u;
		if(s.readyState){
			s.onreadystatechange = function(){
				if(s.readyState=='loaded' || s.readyState=='complete'){
					if(c && typeof c=='function'){c();}
					s.onreadystatechange = null;
				}
			};
		}else{
			s.onload = function(){
				if(c && typeof c=='function'){c();}
				s.onload = null;
			};
		}
		b[gtElems]('head')[0].appendChild(s);
	};
	travelobby.prototype.loadCss=function(u){
		$('<link>').appendTo('head').attr({type:'text/css',rel:'stylesheet'}).attr('href',u);
	};
	var counter=0;
	travelobby.prototype.init = function(options,done){
		
		counter++;
		var slf = this;
		if(typeof jQuery=='undefined'){
			weloadjq = true;
			slf.loadScript(jqurl,function(){
				slf.loadScript(jqmgurl,function(){slf.init(options,done);});
			});
		}else{
			if(typeof jQuery.ui=='undefined'){
				weloadjqui = true;
				slf.loadScript(jquiurl,function(){slf.init(options,done);});
			}else{
				var opts = options || {};
				if($.inArray(options.theme,ths)!=-1){
					dfth = options.theme;
				}
				if(weloadjqui){//if we have loaded jquery ui, then we load the css stylesheet as well
					slf.loadCss(baseuipre+dfth+baseuipost);
				}
				
				slf.opts = options;
				slf.parseForms();
				slf.parseLinks();
				done();
			}
		}
	};
	travelobby.prototype.formChanged = function(frm,clicked){
		var send = $(frm).find('[data-travelobby-search-link]').first();
		var nodeName = $(send).get(0).nodeName.toLowerCase();
		if( typeof this.opts.newWindow !='undefined' && this.opts.newWindow==1){
			if(nodeName=='a' ){
				$(send).attr('target','_blank');
			}else if(nodeName=='button'){
				$(frm).attr('target','_blank');
			}
		}
		var checkinO = $(frm).find('[data-travelobby-checkin]').first();
		var checkoutO = $(frm).find('[data-travelobby-checkout]').first();
		var checkin = $.datepicker.formatDate('yy-mm-dd',$.datepicker.parseDate(this.opts.dateFormat,checkinO.val()));
		var checkout = $.datepicker.formatDate('yy-mm-dd',$.datepicker.parseDate(this.opts.dateFormat,checkoutO.val()));
		var furl = this.opts.bookingUrl+'?checkin='+checkin+'&checkout='+checkout;
		var rooms = $(frm).find('[data-travelobby-rooms]').first();
		if($(rooms).get(0)!=null){
			var numrooms = parseInt($(rooms).find('option:selected').val());
			if(numrooms>0){
				furl+='&rooms='+numrooms;
			}
		}
		var adults = $(frm).find('[data-travelobby-adults]').first();
		if($(adults).get(0)!=null){
			var numadults = parseInt($(adults).find('option:selected').val());
			if(numadults>0){
				furl+='&adults='+numadults;
			}
		}
		//alert(furl);
		if(nodeName=='button'){
			$(frm).attr('method','get');
			$(frm).attr('action',furl);
			
		}else if(nodeName=='a'){
			$(send).attr('href',furl);
		}
		//alert($(send).attr('href'));
		if(clicked)$(send).get(0).click();
	};
	travelobby.prototype.parseForms = function(){
		var slf = this;
		$("form[data-travelobby-form]").each(function(i,frm){
			if($(frm).hasClass('hasTravelobby')){
				return;
			}
			$(frm).addClass('hasTravelobby');
			var send = $(frm).find('[data-travelobby-search]').first();
			var nodeName = $(send).get(0).nodeName.toLowerCase();
			if(nodeName=='button'){
				//alert('btn');
				$(send).on('click',function(){slf.formChanged(frm,true);return false;});
				var link = $("<a>");
				$(link).css({position:'absolute','top':'-10000'});
				$(link).attr('data-travelobby-search-link',1);
				$(link).html('book now');
				//alert(link);
				$(frm).append($(link));
			}else{
				$(send).removeAttr('data-travelobby-search').attr('data-travelobby-search-link');
			}
			var today = new Date();
			var tom = new Date();tom.setDate(tom.getDate()+1);
			
			if($(frm).attr('data-travelobby-available-date')!=null){
				//get first available date and processForm
				slf.getFirstAvailableDate(function(data){
					if(data.date!=null){
						today = $.datepicker.parseDate('yy-mm-dd',data.date);
						tom = new Date(today.getTime());tom.setDate(tom.getDate()+1);
					}
					processForm();
				});
			}else{
				processForm();
			}
			var processForm = function(){
				var checkin = $(frm).find('[data-travelobby-checkin]').first();
				var checkout = $(frm).find('[data-travelobby-checkout]').first();
				
				$(checkin).datepicker({
					dateFormat:slf.opts.dateFormat,
					minDate:today,
					onSelect:function(){
						setTimeout(function(){
							var checkinD = $.datepicker.parseDate(slf.opts.dateFormat,$(checkin).val());
							var checkoutD = $.datepicker.parseDate(slf.opts.dateFormat,$(checkout).val());
							
							if(checkinD.getTime()>=checkoutD.getTime()){
								checkoutD = new Date(checkinD.getTime());checkoutD.setDate(checkoutD.getDate()+1);
							}
							$(checkout).val($.datepicker.formatDate(slf.opts.dateFormat,checkoutD));
							var minDate = new Date(checkinD.getTime());
							minDate.setDate(minDate.getDate()+1);
							$(checkout).datepicker('option','minDate',minDate);
							slf.formChanged(frm);
						},50);
					}
				});
				
				$(checkout).datepicker({
					dateFormat:slf.opts.dateFormat,
					minDate:tom,
					onSelect:function(){
						slf.formChanged(frm);
					}
				});
				if($(checkin).val()==''){
					$(checkin).datepicker('setDate',today);
				}
				if($(checkout).val()==''){
					$(checkout).datepicker('setDate',tom);
				}
				slf.formChanged(frm);
			};
		});
	};
	travelobby.prototype.parseLinks = function(){
		var slf = this;
		$("[data-travelobby-room]").each(function(i,link){
			if($(link).hasClass('hasTravelobby')){
				return;
			}
			var nodeName = $(link).get(0).nodeName.toLowerCase();
			$(link).addClass('hasTravelobby');
			var roomCode = $(link).attr('data-travelobby-room');
			var furl = slf.opts.bookingUrl+'?room='+roomCode;
			if(nodeName=='a'){
				$(link).attr('href',furl);
			}else if(nodeName=='button'){
				$(link).attr('onclick',"window.location.href='"+furl+"';");
			}
			var availableRate = $(link).attr('data-travelobby-available-rate');
			if(availableRate!=null){
				slf.getFirstAvailableLowestRateByCode($(link));
			}
		});
	};
	travelobby.prototype.getFirstAvailableLowestRateByCode = function(link){
		var roomCode = $(link).attr('data-travelobby-room');
		var slf = this;
		var randomint = Math.floor(Math.random()*(100000-1))+1;
		var callbackName = '__jsonCallbackRoom'+randomint;
		window[callbackName] = function(data){
			//alert(data);
			//alert(JSON.stringify(data));
			if(data.data){
				//alert(true);
				var availableRateName = $(link).attr('data-travelobby-available-rate');
				if(availableRateName==''){
					availableRateName = '__availableRate__';
				}
				var span = $(link).find('span').first();
				var spanHtml = span.html()+'';
				
				spanHtml = spanHtml.replace(availableRateName,data.data.rateprice+'');
				
				span.html(spanHtml);
				
				$(span).removeAttr('style');//.css('display','inline-lock');
			}
		};
		$.ajax({
			url:this.opts.apiUrl+'/api/v1/rooms/first-available-lowest-rate-bycode/?callback='+callbackName+'&roomcode='+roomCode,
			dataType:'script',
			success:function(){
				window[callbackName] = null;
				delete window[callbackName];
			}
		});
	};
	travelobby.prototype.getFirstAvailableDate = function(cb){
		var slf = this;
		var randomint = Math.floor(Math.random()*(100000-1))+1;
		var callbackName = '__jsonCallback'+randomint;
		window[callbackName] = function(data){
			//alert(data);
			cb(data);
		};
		$.ajax({
			url:this.opts.apiUrl+'/api/v1/first-available-date/?callback='+callbackName,
			dataType:'script',
			success:function(){
				window[callbackName] = null;
				delete window[callbackName];
			}
		});
	};
	var travel = new travelobby();
	window.__travel = travel;
	
})();
