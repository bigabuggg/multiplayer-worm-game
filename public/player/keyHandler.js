



//keyboard variables----------------
var keys = {};
var right_pressed = false;
var left_pressed = false;
var up_pressed = false;
var down_pressed = false;

var right_arrow_pressed = false;
var left_arrow_pressed = false;
var up_arrow_pressed = false;
var down_arrow_pressed = false;

var space_pressed = false;




//mechanic keys-----
var e_pressed = false;
var shift_pressed = false;
var r_pressed = false;


//inventory keys-----
var one_key_pressed = false;
var two_key_pressed = false;
var three_key_pressed = false;

var pickUpArr = [];



//jquery for  movement---

$(document).keydown(function (e){

    if (e.which == 87){
      //w is pressed
      up_pressed = true;
    }



    if (e.which == 65){
      //a is pressed
      left_pressed = true;
    }



    if (e.which == 83){
      //s is pressed
      down_pressed = true;
    }



    if (e.which == 68){
      //d is pressed
      right_pressed = true;
    }






    if (e.which == 39) {
    //d is pressed
    right_arrow_pressed = true;
    }

    if (e.which == 37) {
    //a is pressed
    left_arrow_pressed = true;
    }

    if (e.which == 38) {
    //w is pressed
    up_arrow_pressed = true;
    }

    if (e.which == 40) {
    //s is pressed
    down_arrow_pressed = true;
    }



    if (e.which == 32 || e.which == 13){
    space_pressed = true;
    return false;
    //space is pressed
    }




    //mechanic keys-----
    if (e.which == 69){
      e_pressed = true;
    }


    if (e.which == 16){
      shift_pressed = true;
    }


    if (e.which == 82){
      r_pressed = true;
    }




    //inventory keys-----

    if (e.which == 49) {
    //1 is pressed
    one_key_pressed = true;
    }



    if (e.which == 50){
    two_key_pressed = true;
    //2 is pressed
    }



    if (e.which == 51){
    three_key_pressed = true;
    //3 is pressed
    }

    
  

});







$(document).keyup(function (e) {
    delete keys[e.which]; 

    if (e.which == 68) {
    //d is pressed
    right_pressed = false;
    }

    if (e.which == 65) {
    //a is pressed
    left_pressed = false;
    }   

    if (e.which == 87) {
    //w is pressed
    up_pressed = false;
    }

    if (e.which == 83) {
    //s is pressed
    down_pressed = false;
    }   




    if (e.which == 39) {
    //d is pressed
    right_arrow_pressed = false;
    }

    if (e.which == 37) {
    //a is pressed
    left_arrow_pressed = false;
    }

    if (e.which == 38) {
    //w is pressed
    up_arrow_pressed = false;
    }

    if (e.which == 40) {
    //s is pressed
    down_arrow_pressed = false;
    }



    if (e.which == 32 || e.which == 13){
    space_pressed = false;
    //space is pressed
    }




    //mechanic keys-----
    if (e.which == 69){
      e_pressed = false;
    }


    if (e.which == 16){
      shift_pressed = false;
    }


    if (e.which == 82){
      r_pressed = false;
    }




    //inventory keys-----

    if (e.which == 49) {
    //1 is pressed
    one_key_pressed = false;
    }



    if (e.which == 50){
    two_key_pressed = false;
    //2 is pressed
    }



    if (e.which == 51){
    three_key_pressed = false;
    //3 is pressed
    }



});
//jquery for  movement---
