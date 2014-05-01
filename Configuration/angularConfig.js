define([ "angular", "Application/ImageController", "Service/PPIService", "angular-route" ] ,function(
			angular, ImageController, PPIService) {
	'use strict';

	
	var app = angular.module('App', [ 'ngRoute' ]);
	app.config(function($routeProvider) {
		$routeProvider.when('/', {
		    templateUrl: require.toUrl('Resources/Views/imageView.html'),
		    controller: ImageController
		});

		/*$routeProvider.when('/contacts', {
			templateUrl: 'Resources/Views/contactView.html',
			controller: 'ContactController'
		});*/

		$routeProvider.otherwise({
			redirectTo:'/'
		});
	});

	app.directive('contenteditable', function() {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl) {
				// view -> model
				element.bind('blur', function() {
					scope.$apply(function() {
						ctrl.$setViewValue(element.html());
					});
				});

				// model -> view
				ctrl.$render = function() {
					element.html(ctrl.$viewValue);
				};

				// load init value from DOM
				ctrl.$render();
			}
		};
	});


	/**
	 * Dragpoint directive
	 *
	 * @desc Stores the moved distance in cm to the goive properties
	 *
	 * @example:
	 * <span data-dragpoint="true" data-pos-left="title.left"  data-pos-top="title.top">move</span>
	 */
	app.directive('dragpoint', function($document, $parse) {
		return function(scope, element, attrs) {
			var startX = 0, startY = 0;
			var pxPerCm = PPIService.calcPPI();

			element.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();

				startX = event.pageX;
				startY = event.pageY;

				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});

			function mousemove(event) {
				scope.$apply(function() {
					var posTop = parseFloat($parse(attrs.posTop)(scope));
					var posLeft = parseFloat($parse(attrs.posLeft)(scope));

					var adjustY = (event.pageY - startY)/pxPerCm;
					var adjustX = (event.pageX - startX)/pxPerCm;

					$parse(attrs.posTop).assign(scope,Math.round((adjustY + posTop)*10)/10);
					$parse(attrs.posLeft).assign(scope,Math.round((adjustX + posLeft)*10)/10);

					startX = event.pageX;
					startY = event.pageY;
				});
			}

			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}
		};
	});


	app.directive('ngChange', function() {
		return {
			//restrict: 'A',
			scope:{'ngChange':'=' },
			link: function(scope, elm, attrs) {
				scope.$watch('onChange', function(nVal) { elm.val(nVal); });
				elm.bind('blur', function() {
					var currentValue = elm.val();
					if( scope.onChange !== currentValue ) {
						scope.$apply(function() {
							scope.onChange = currentValue;
						});
					}
				});
			}
		};
	});

	/**
	 * data-ng-input directive
	 *
	 * @example
	 * <textarea data-ng-input="true" data-callback="page.addImagePaths(value)"></textarea>
	 *
	 * 'value' is the placeholder used to insert the element value
	 */
	app.directive('ngInput', function($document,$parse) {
		return {
			scope: {
				callback: '&callback'
			},
			restrict: 'A',
			link: function(scope, elements, attrs) {
				var element = elements[0];
				element.addEventListener('input', function (event){
					var callback = $parse(scope.callback);
					scope.$apply(function () {
						if(element.value && (element.value != "")) {
							callback({value : element.value}, scope);
						}
					});
					element.value = "";
				});
			}
		};
	});


	/* controllers */
	app.controller('ImageController', ImageController);
	ImageController.$inject = ['$scope', '$location'];
	
	return app;
});
