$(document).ready(()=> {
  // navbar background-color transition
  var scroll_start = 0;
  var startchange = $('#intro');
  var offset = startchange.offset();
  if (startchange.length){
    $(document).scroll(()=> {
      scroll_start = $(this).scrollTop();
      if(scroll_start > offset.top) {
          $(".navbar").css('background-color', '#fff');
       } else {
          $('.navbar').css('background-color', 'rgba(255, 255, 255 , 0.5)');
       }
    });
  };

  // Add smooth scrolling on all links inside the navbar
  $('body').scrollspy({target: ".navbar", offset: 50});

  $(".navbar a").on('click', function(event) {
    if (this.hash !== "") {

      // Prevent default anchor click behavior
      event.preventDefault();

      var hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
        window.location.hash = hash;
      });
    }
  });
});
