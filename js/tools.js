(function(window){
	var BASEURL = '';

	window.tools = {
		BaseUrl : BASEURL,
		Ajax : Ajax,
		addLoading : addloading,
		closeMask : closemask,
		getWebId : getwebid,
		copyObj : copyobj,
		preLoad : preload,
		openWindow : openWindow,
		renderTime : rendertime,
		getLocation : getLocation,
		closeAndBack : closeandback
	}

	function Ajax(options, successcb, errorcb, nonetworkcb) {
		var net = plus.networkinfo.getCurrentType();
		if (net != 0 && net != 1) {
			innerAjax(options, successcb, errorcb)
		} else {
			if (nonetworkcb) {
				nonetworkcb()
			} else {
				document.getElementById('posiab').style.display = 'block'
				plus.navigator.closeSplashscreen();
				mui.toast('未连接网络,请链接网络重试');
				errorcb && errorcb({
					status: "neterror",
					messages: "当前无网络状态，请重试"
				})
			}
		}
	}

	function addloading(loadobj) {
		var mask = document.getElementById("mask");
		if (!mask) {
			var newmask = document.createElement('div');
			newmask.id = 'mask';
			var loading = document.createElement('div');
			loading.className = 'loading';
			var img = document.createElement('img');
			img.src = '../../img/loading.gif';
			loading.appendChild(img)
			newmask.appendChild(loading);
			document.getElementsByTagName('body')[0].appendChild(newmask);
		}
	}

	function closemask() {
		var mask = document.getElementById("mask");
		if (mask) {
			mask.style.display = 'none'
		}
	}

	function innerAjax(options, successcb, errorcb) {

		var op = {
			ifloading: false,
			dataType: 'json',
			type: 'post',
			loading: {},
			url: '',
			data: {}
		};
	//	copyobj(options, op);
		mui.extend(op,options,true);
		if (op.ifloading) {
			addloading()
		}
		mui.ajax(BASEURL + op.url, {
			type: op.type,
			data: op.data,
			dataType: op.dataType,
			timeout: '10000',
			success: function(data) {
				
				if (data.status == 'success') {
					closemask()
					successcb(data)
				} else if (data.status == 'errors') {
					closemask()
					errorcb(data);
				} else if (data.status == 'notlogins') {
					console.log('now need login')
					login(function() {
						innerAjax(options, successcb, errorcb)
					})
				}
			},
			error: function(data) {
				closeMask();
				errorcb(data)
			}
		})
	}

	function getwebid(url) {
		var start = url.lastIndexOf('/');
		var end = url.indexOf('.html');
		var pageid = url.substring(start + 1, end);
		return pageid;
	}

	function copyobj(from, to) {
		for (var i in from) {
			if (typeof from[i] == 'object') {
				copyobj(from[i], to[i])
			} else {
				to[i] = from[i];
			}
		}
	}

	function preload(webArr, cb) {
		var len = webArr.length;
		for (var i = 0; i < len; i++) {
			var pageid = getwebid(webArr[i]);
			var temppage = 'page' + i;
			if (webArr) {
				temppage = mui.preload({
					url: webArr[i],
					id: pageid
				})
			}
		}
		cb && cb();
	}

	function openWindow(url, param, aniType, aniTime) {
		// 通过url获取当前id
		if (window.plus) {
			mui.openWindow({
				id: getwebid(url),
				url: url,
				extras: param || {},
				show: {
					autoShow: true,
					aniShow: aniType || "slide-in-right",
					duration: aniTime || 300
				},
				waiting: {
					autoShow: false,
					title: '正在加载...',
					options: {
						background: '#d1d1d1',
						width: 100,
						height: 100
					}
				}
			})
		} else {
			alert('system is not ready')
		}
	}

	function rendertime(time) {
		var start = time.substring(5, 7);
		var end = time.substring(8, 10);
		if (start.substring(0, 1) == '0') {
			start = start.substr(1, 2)
		}
		if (end.substring(0, 1) == '0') {
			end = start.substr(1, 2)
		}
		return start + '月' + end + '日';
	}

	// 获取地理位置回调函数
	function getLocation(callback) {
		plus.geolocation.getCurrentPosition(function(pos) {
			callback({
				longitude: pos.coords.longitude,
				latitude: pos.coords.latitude,
				address: pos.address
			})
		}, function(err) {
			mui.toast("获取地理位置失败");
		}, {
			provider: 'baidu',
			timeout: 60000,
			maximumAge: 600000
		})
	}

	function closeandback(obj) {
		obj = obj || {};
		var iid = plus.webview.getLaunchWebview().id
		obj.backto = obj.backto || iid;
		var all = plus.webview.all();
		var cpage = plus.webview.currentWebview().id;
		var len = all.length;
		for (var i = 0; i < len; i++) {
			if (all[i].id != cpage && all[i].id != obj.backto) {
				all[i].close('none', 0)
			}
		}
		obj.cb && obj.cb();
		mui.back()
	}
})(window)