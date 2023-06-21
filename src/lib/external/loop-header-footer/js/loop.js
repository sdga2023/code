// @codekit-prepend "util.js"
// @codekit-prepend "collapse.js"
// @codekit-prepend "dropdown.js"



function submit_search_annual_form() { 

    var global_qvalue = document.getElementById('qterm_id').value;

    if(global_qvalue==""){
        global_qvalue = document.getElementById('mobile-globalsearch').value;
    }
   
    if(global_qvalue==""){
        return false;
    }
    document.getElementById("globalsearchId").action = "https://www.worldbank.org/en/meetings/splash/annual/searchlist" + "?q=" + global_qvalue;
    document.getElementById("global_search").value = global_qvalue;
    document.getElementById("globalsearchId").submit();
    return false;
}
$(function () { 
    $('.lp__navbar_toggle').on('click', function (e) {
        var menuItem = $( e.currentTarget );

        if (menuItem.attr( 'aria-label') === 'menu') {
            $(this).attr( 'aria-label', 'close menu');
        } else {
            $(this).attr( 'aria-label', 'menu');
        }
    });
});