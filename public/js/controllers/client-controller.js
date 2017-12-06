/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js", function(){
    particlesJS('particles-js',
        {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ff475a"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    },
                    "image": {
                        "width": 100,
                        "height": 100
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 5,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 20,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 3,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "bubble"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 400,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 200,
                        "size": 10,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 2
                    },
                    "repulse": {
                        "distance": 200
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true,
            "config_demo": {
                "hide_card": false,
                "background_color": "#b61924",
                "background_image": "",
                "background_position": "50% 50%",
                "background_repeat": "no-repeat",
                "background_size": "cover"
            }
        }
    );

});

(function() {
    'use strict';

    var app = angular.module('gitHubApp');
    app.controller('ClientPageCtrl',['clientSRV','$rootScope','$window','$scope','$location','$sessionStorage', function (clientSRV,$rootScope, $window,$scope,$location,$sessionStorage) {

        $rootScope.navbarActive = "home";

        $scope.categories=[];
        $scope.newCategory="";
        var elements = $('.reveal');
        var win = $(window);
        elements.css('opacity', 0);
        var isVisible = function(elem)
        {
            var docViewTop = win.scrollTop();
            var docViewBottom = docViewTop + win.height();

            var elemTop = elem.offset().top;
            var elemBottom = elemTop + elem.height();

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        };
        win.scroll(function(event) {
            elements.each(function(i, el) {
                var el = $(el);
                if (isVisible(el)) {
                    el.addClass("animated fadeInUp");
                }
            });
        });

        function convertFromHex(hex) {
            var hex = hex.toString();
            var str = '';
            for (var i = 0; i < hex.length; i += 2){
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
            }
            return str; }

        angular.element(document).ready(function () {

            clientSRV.getCategories($sessionStorage.get("token"),function (callback) {

                if (callback==='undefined'){
                    alert('Error')
                }
                else{
                    $scope.categories=callback
                }
            })

        });

        $scope.newSecret=function () {

            if(typeof $scope.category!=='undefined'&&typeof $scope.secret!=='undefined')
            {
                var category="";
                if($scope.category!="Other"){
                    category=$scope.category;
                }
                else{
                    category=$scope.newCategory;
                }
                var data={
                    category: category,
                    secret: CryptoJS.AES.encrypt($scope.secret,CryptoJS.RIPEMD160($scope.key).toString()).toString(),
                    token:$sessionStorage.get("token")
                };

                clientSRV.newSecret(data,function (callback) {
                    if (callback==='undefined'){
                        alert('Error')
                    }
                    else{
                        alert(callback)
                        if($scope.category="Other"){
                            location.reload()
                        }
                        $scope.category='';
                        $scope.secret='';
                        $scope.key='';
                    }


                },function (err) {
                    alert(err)
                })
            }
           else{
                $scope.textarea=('Error: Missing fields')
            }
        };

        $scope.getSecrets=function () {
            /*var password=CryptoJS.RIPEMD160($scope.key).toString();
            var passHex=secrets.str2hex(password);
            var shares=secrets.share(passHex,3,3,512);
            var combine=secrets.combine([shares[0],shares[1],shares[2]])
            console.log(secrets.hex2str(combine))
            console.log(password)*/

            if(typeof $scope.category!=='undefined'){
                var data={
                    category: $scope.category,
                    token:$sessionStorage.get("token")
                };

                clientSRV.getSecrets(data,function (callback) {


                    var secrets=[];
                    var callsecrets=callback;
                    var text='';

                    for(var i=0;i<callsecrets.length;i++) {
                        secrets.push(convertFromHex(CryptoJS.AES.decrypt(callsecrets[i], CryptoJS.RIPEMD160($scope.key).toString()).toString()))
                        text=text+ secrets[i]+' ,'
                    }
                    $scope.textarea="Secrets obtained correctly: "+text;
                    //alert("Secrets obtained correctly: "+secrets);
                    $scope.category='';
                    $scope.secret='';
                    $scope.key='';


                },function (err) {
                    $scope.textarea=('Error: Missing fields or wrong credentials ')
                })
            }
            else{
                $scope.textarea=('Error: Category is missing')
            }


        }

    }]);
})();