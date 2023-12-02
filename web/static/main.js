$(function(){
    $('#style').dropdown({
        onChange: function(value, text, $selectedItem) {
          console.log(value)
        }
    })
});