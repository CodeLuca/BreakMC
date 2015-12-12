$('#ticketType').change(function() {
  var self = $(this).val();

  $('.ticket').not('.' + self).slideUp(300, function() {
    $('.' + self).slideDown(300);
  });
});